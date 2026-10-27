import { useMemo, useState } from 'react';
import { CalendarDays, ChevronRight, Clock3, GraduationCap, MapPin, Search, UserRound } from 'lucide-react';
import timetable from '../data/lguExactData.json';

const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
const semesterNames = timetable.semesters.map((item) => item.label || item.value || item);
const programNamesFor = (semester) => (timetable.programsBySemester[semester] || []).map((item) => item.label || item.value || item);
const firstSemester = semesterNames[0] || '';
const firstProgram = programNamesFor(firstSemester)[0] || '';
const firstSection = timetable.semesterCombos.find((item) => item.semester === firstSemester && item.program === firstProgram)?.section || '';

function ScheduleGrid({ entries, title, subtitle }) {
  return (
    <section className="card timetable-result">
      <div className="timetable-result-head">
        <div><p className="eyebrow">SOURCE-SYNCED RESULT</p><h2>{title}</h2><p className="muted">{subtitle}</p></div>
        <span className="timetable-count"><CalendarDays size={15} /> {entries.length} classes</span>
      </div>
      <div className="timetable-grid">
        {DAYS.map((day) => {
          const dayEntries = entries.filter((entry) => entry.day === day);
          return <div className="timetable-day" key={day}><div className="timetable-day-title"><span>{day.slice(0, 3).toUpperCase()}</span><strong>{day}</strong></div><div className="timetable-day-list">{dayEntries.length ? dayEntries.map((entry, index) => <article className="timetable-class" key={`${day}-${entry.start}-${entry.course}-${index}`}><span className="timetable-time"><Clock3 size={13} /> {entry.start}–{entry.end}</span><h3>{entry.course}</h3><p>{entry.teacher}</p><div><span><MapPin size={12} /> {entry.room}</span><span>{entry.mode || 'On campus'}</span></div></article>) : <p className="timetable-empty">No classes</p>}</div></div>;
        })}
      </div>
    </section>
  );
}

function SemesterTab() {
  const [semester, setSemester] = useState(firstSemester);
  const [program, setProgram] = useState(firstProgram);
  const [section, setSection] = useState(firstSection);
  const programNames = programNamesFor(semester);
  const sectionNames = useMemo(() => timetable.semesterCombos.filter((item) => item.semester === semester && item.program === program).map((item) => item.section), [semester, program]);
  const record = timetable.semesterCombos.find((item) => item.semester === semester && item.program === program && item.section === section);
  return <div className="timetable-workspace"><div className="timetable-form card"><p className="eyebrow">STUDENT TIMETABLE</p><h2>Semester, program & section</h2><p className="muted">The original LGU sequence, now inside your website.</p><div className="timetable-fields"><label className="label">Semester<select className="input" value={semester} onChange={(event) => { setSemester(event.target.value); setProgram(''); setSection(''); }}><option value="">Select semester</option>{semesterNames.map((item) => <option key={item}>{item}</option>)}</select></label><label className="label">Program<select className="input" value={program} onChange={(event) => { setProgram(event.target.value); setSection(''); }} disabled={!semester}><option value="">Select program</option>{programNames.map((item) => <option key={item}>{item}</option>)}</select></label><label className="label">Section<select className="input" value={section} onChange={(event) => setSection(event.target.value)} disabled={!program}><option value="">Select section</option>{sectionNames.map((item) => <option key={item}>{item}</option>)}</select></label></div><p className="timetable-source"><GraduationCap size={15} /> 211 exact semester/program/section combinations imported</p></div>{record ? <ScheduleGrid title={`${record.program} · ${record.section}`} subtitle={record.semester} entries={record.entries} /> : <div className="card timetable-empty-state">Choose a semester, program, and section to view the timetable.</div>}</div>;
}

function TeacherTab() {
  const [department, setDepartment] = useState(timetable.departments[0]?.name || '');
  const [query, setQuery] = useState('');
  const [teacher, setTeacher] = useState(timetable.teachers.find((item) => item.department === department)?.name || '');
  const teachers = timetable.teachers.filter((item) => item.department === department && item.name.toLowerCase().includes(query.toLowerCase()));
  const record = timetable.teachers.find((item) => item.name === teacher);
  return <div className="timetable-workspace"><div className="timetable-form card"><p className="eyebrow">FACULTY TIMETABLE</p><h2>Find a teacher</h2><p className="muted">Search the exact teacher directory imported from LGU.</p><div className="timetable-fields"><label className="label">Department<select className="input" value={department} onChange={(event) => { setDepartment(event.target.value); setTeacher(''); }}><option value="">Select department</option>{timetable.departments.map((item) => <option key={item.name}>{item.name}</option>)}</select></label><label className="label">Search teacher<div className="input-with-icon"><Search size={16} /><input className="input" value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Teacher name" /></div></label><label className="label">Teacher<select className="input" value={teacher} onChange={(event) => setTeacher(event.target.value)} disabled={!department}><option value="">Select teacher</option>{teachers.map((item) => <option key={item.id}>{item.name}</option>)}</select></label></div><p className="timetable-source"><UserRound size={15} /> 399 exact teacher timetable pages imported</p></div>{record ? <ScheduleGrid title={record.name} subtitle={record.department} entries={record.entries} /> : <div className="card timetable-empty-state">Choose a teacher to view the weekly timetable.</div>}</div>;
}

function RoomTab() {
  const [room, setRoom] = useState('');
  const [mode, setMode] = useState('Day');
  const [day, setDay] = useState('Monday');
  const roomNames = useMemo(() => Array.from(new Set(timetable.semesterCombos.flatMap((item) => item.entries || []).map((entry) => entry.room).filter(Boolean))).sort(), []);
  const entries = useMemo(() => timetable.semesterCombos.flatMap((item) => (item.entries || []).map((entry) => ({ ...entry, program: item.program, section: item.section }))).filter((entry) => (!room || entry.room === room) && (mode === 'Week' || entry.day === day)).slice(0, 120), [room, mode, day]);
  return <div className="timetable-workspace"><div className="timetable-form card"><p className="eyebrow">ROOM TIMETABLE</p><h2>Check a classroom</h2><p className="muted">Search exact room usage across the synced LGU records.</p><div className="timetable-fields"><label className="label">Room<select className="input" value={room} onChange={(event) => setRoom(event.target.value)}><option value="">All rooms</option>{roomNames.map((item) => <option key={item}>{item}</option>)}</select></label><label className="label">View<select className="input" value={mode} onChange={(event) => setMode(event.target.value)}><option>Day</option><option>Week</option></select></label>{mode === 'Day' && <label className="label">Day<select className="input" value={day} onChange={(event) => setDay(event.target.value)}>{DAYS.map((item) => <option key={item}>{item}</option>)}</select></label>}</div><p className="timetable-source"><MapPin size={15} /> {roomNames.length} rooms found in the synced timetable records</p></div><ScheduleGrid title={room || 'All rooms'} subtitle={mode === 'Week' ? 'Week view' : `${day} view`} entries={entries} /></div>;
}

export default function TimetablePage() {
  const [tab, setTab] = useState('semester');
  return <div className="container timetable-page"><div className="timetable-hero"><div><p className="eyebrow">LGU TIMETABLE · IN YOUR CAMPUS APP</p><h1>Every class, one familiar place.</h1><p>Exact LGU records are now part of Find My Class. Select a student, teacher, or room view without leaving your project.</p></div><span className="timetable-stat"><strong>211</strong><small>semester combinations</small></span></div><div className="timetable-tabs" role="tablist">{[['semester', 'Semester', GraduationCap], ['teacher', 'Teacher', UserRound], ['room', 'Room', MapPin]].map(([value, label, Icon]) => <button key={value} className={tab === value ? 'is-active' : ''} onClick={() => setTab(value)} role="tab" aria-selected={tab === value}><Icon size={16} /> {label}<ChevronRight size={14} /></button>)}</div>{tab === 'semester' ? <SemesterTab /> : tab === 'teacher' ? <TeacherTab /> : <RoomTab />}</div>;
}
