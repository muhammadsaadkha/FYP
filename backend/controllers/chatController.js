import NavigationLocation from '../models/NavigationLocation.js';
import Classroom from '../models/Classroom.js';
import Building from '../models/Building.js';
import timetable from '../data/lguExactData.json' with { type: 'json' };

const STOP_WORDS = new Set(['the', 'a', 'an', 'is', 'at', 'in', 'on', 'to', 'from', 'for', 'of', 'my', 'me', 'please', 'tell', 'show', 'what', 'when', 'where', 'how', 'can', 'i', 'and', 'or', 'ka', 'ki', 'ke', 'ko', 'hai', 'he', 'mujhe', 'batao', 'btao', 'jana', 'jaana']);
const SCHEDULE_WORDS = ['timetable', 'schedule', 'class', 'lecture', 'subject', 'course', 'teacher', 'faculty', 'section', 'semester', 'room', 'lab', 'time'];
const ROUTE_WORDS = ['route', 'path', 'directions', 'navigate', 'walk', 'where', 'location', 'jana', 'jaana', 'raasta', 'rasta', 'pohanch'];

function normalize(value = '') {
  return String(value).toLowerCase().replace(/[^a-z0-9\s/-]/g, ' ').replace(/\s+/g, ' ').trim();
}
function tokens(value = '') {
  return normalize(value).split(' ').filter((token) => token && !STOP_WORDS.has(token));
}
function escapeRegex(value) {
  return String(value).replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}
function containsAny(text, words) {
  const normalized = normalize(text);
  return words.some((word) => normalized.includes(word));
}
function entryText(item, entry) {
  return [item.semester, item.program, item.section, entry.course, entry.room, entry.teacher, entry.day, entry.start, entry.end].join(' ');
}
function retrieveSchedule(query, limit = 8) {
  const queryTokens = tokens(query);
  const hits = [];
  for (const item of timetable.semesterCombos) {
    for (const entry of item.entries || []) {
      const text = normalize(entryText(item, entry));
      const matched = queryTokens.filter((token) => text.includes(token));
      if (!matched.length) continue;
      const exactPhrase = normalize(query).includes(normalize(entry.course)) || normalize(query).includes(normalize(entry.teacher));
      const score = matched.length * 2 + (exactPhrase ? 5 : 0) + (text.includes(normalize(item.program)) ? 1 : 0);
      hits.push({ score, type: 'semester', semester: item.semester, program: item.program, section: item.section, entry });
    }
  }
  for (const teacher of timetable.teachers) {
    for (const entry of teacher.entries || []) {
      const text = normalize([teacher.department, teacher.name, entry.course, entry.room, entry.day, entry.start, entry.end].join(' '));
      const matched = queryTokens.filter((token) => text.includes(token));
      if (!matched.length) continue;
      hits.push({ score: matched.length * 2 + (normalize(query).includes(normalize(teacher.name)) ? 6 : 0), type: 'teacher', teacher: teacher.name, department: teacher.department, entry });
    }
  }
  const unique = new Map();
  for (const hit of hits.sort((a, b) => b.score - a.score)) {
    const key = `${hit.type}|${hit.teacher || hit.program}|${hit.entry.course}|${hit.entry.day}|${hit.entry.start}|${hit.entry.room}`;
    if (!unique.has(key)) unique.set(key, hit);
    if (unique.size >= limit) break;
  }
  return Array.from(unique.values());
}

async function retrieveLocation(term, excludeId = '') {
  const clean = String(term || '').trim();
  if (!clean) return null;
  const normalizedTerm = normalize(clean);
  const termTokens = tokens(clean);
  const regex = new RegExp(termTokens.map(escapeRegex).join('|') || escapeRegex(clean.slice(0, 80)), 'i');
  let locations = await NavigationLocation.find({ name: regex, kind: { $in: ['point', 'place'] } }).limit(50).lean();
  locations = locations
    .filter((location) => String(location._id) !== String(excludeId))
    .map((location) => {
      const name = normalize(location.name);
      const tokenScore = termTokens.filter((token) => name.includes(token)).length;
      const exactScore = name.includes(normalizedTerm) ? 10 : 0;
      return { location, score: tokenScore * 2 + exactScore };
    })
    .sort((a, b) => b.score - a.score);
  if (locations.length && locations[0].score >= (termTokens.length > 1 ? 4 : 2)) return locations[0].location;
  const room = await Classroom.findOne({ roomNumber: regex }).populate('buildingId', 'name').lean();
  if (room && String(room._id) !== String(excludeId)) return { _id: room._id, name: room.roomNumber, building: room.buildingId, floor: room.floor, kind: 'point' };
  const building = await Building.findOne({ name: regex }).lean();
  if (building && String(building._id) !== String(excludeId)) return { _id: building._id, name: building.name, floors: building.floors, kind: 'building' };
  return null;
}

function parseRouteTerms(query) {
  const match = String(query).match(/(?:from|starting\s+from|se|say)\s+(.+?)\s+(?:to|towards|tak|jaana|jana)\s+(.+)/i);
  if (match) return { from: match[1].trim(), to: match[2].trim().replace(/[?.!]+$/, '') };
  return null;
}

function formatScheduleMessage(results) {
  if (!results.length) return 'I could not find an exact timetable record for that request. Try a teacher name, course name, room, semester, program, or section.';
  const lines = results.slice(0, 5).map((hit) => {
    const source = hit.type === 'teacher' ? `${hit.teacher} · ${hit.department}` : `${hit.program} ${hit.section} · ${hit.semester}`;
    return `${hit.entry.course} — ${hit.entry.day}, ${hit.entry.start}–${hit.entry.end} · ${hit.entry.room} · ${hit.entry.teacher} (${source})`;
  });
  return `I found these exact LGU timetable records:\n${lines.map((line) => `• ${line}`).join('\n')}`;
}

export async function chat(req, res) {
  const query = String(req.body?.message || '').trim();
  if (!query) return res.status(400).json({ message: 'Please enter a question.' });
  const routeTerms = parseRouteTerms(query);
  if (routeTerms && (containsAny(query, ROUTE_WORDS) || /\b(from|se|say)\b/i.test(query))) {
    const from = await retrieveLocation(routeTerms.from);
    const to = await retrieveLocation(routeTerms.to, from?._id);
    if (from && to && from._id && to._id) {
      const mapUrl = `/map?start=${encodeURIComponent(String(from._id))}&dest=${encodeURIComponent(String(to._id))}`;
      return res.json({ intent: 'navigation', message: `I found a route from ${from.name} to ${to.name}. Open the campus map to draw the saved corridor path.`, navigation: { from, to, mapUrl }, citations: [{ type: 'campus navigation datastore', label: 'Find My Class campus locations' }] });
    }
    return res.json({ intent: 'navigation', message: 'I could not confidently match both places. Use the format “from [start] to [destination]” and use the exact room, building, or location names shown on the campus map.', navigation: null, citations: [{ type: 'campus navigation datastore', label: 'Find My Class campus locations' }] });
  }
  if (containsAny(query, SCHEDULE_WORDS)) {
    const scheduleResults = retrieveSchedule(query);
    return res.json({ intent: 'timetable', message: formatScheduleMessage(scheduleResults), scheduleResults, citations: [{ type: 'exact LGU timetable snapshot', label: '211 semester combinations and 399 teacher records' }] });
  }
  const scheduleResults = retrieveSchedule(query, 4);
  if (scheduleResults.length) return res.json({ intent: 'timetable', message: formatScheduleMessage(scheduleResults), scheduleResults, citations: [{ type: 'exact LGU timetable snapshot', label: 'Retrieved timetable records' }] });
  return res.json({ intent: 'general', message: 'I can help with campus routes and LGU timetables. Ask “from Room 101 to Lab 15” or “BSCS Section A Programming Fundamentals time”.', citations: [{ type: 'assistant scope', label: 'Campus navigation and timetable retrieval' }] });
}
