import { useEffect, useRef, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Layers, Route as RouteIcon, Search as SearchIcon, Wrench } from 'lucide-react';
import { campusMaps } from '../data/campusMaps.js';

const features = [
  {
    icon: SearchIcon,
    title: 'Room search',
    text: 'Type a room number such as 101 or 202-A and see its building, floor and position, then open it straight on the map.'
  },
  {
    icon: RouteIcon,
    title: 'Corridor routing',
    text: 'Paths follow the corridors saved for each floor plan, so the blue line stays in the hallways and never cuts through a classroom.'
  },
  {
    icon: Layers,
    title: 'Multi-floor routes',
    text: 'Start on one floor and finish on another. The route is split by floor and you step through each plan at the stairs.'
  },
  {
    icon: Wrench,
    title: 'Kept current by admins',
    text: 'Signed-in administrators add rooms, doors and corridors from the map itself, so the data matches the building.'
  }
];

const steps = [
  {
    title: 'Choose a start and a destination',
    text: 'On the map page, pick two rooms from the lists. If a room has a door marked on the plan, the route starts or ends at that door.'
  },
  {
    title: 'The server finds a walkable path',
    text: 'Routes follow the corridor lines saved for each floor plan, so the path stays in the hallways instead of crossing rooms.'
  },
  {
    title: 'Follow the blue line',
    text: 'The route is drawn on the current floor plan. Zoom and pan the map to follow it room by room.'
  },
  {
    title: 'Switch floors at the stairs',
    text: 'When the destination is on another floor, the route is split by floor. Use the Next floor button to open the next plan and see the rest.'
  }
];

const stepCaptions = [
  'Start and destination are on different floors.',
  'The path follows the saved corridor lines.',
  'The route is drawn on the first floor.',
  'The rest of the route continues on the second floor.'
];

/* ---------- Hero: 3D floor stack ---------- */

const PLATE = 340;
const GAP = 120;

// Rooms are laid out in four blocks of 2 x 2 around a cross shaped corridor.
const ROOMS = [
  [10, 10],
  [202, 10],
  [10, 202],
  [202, 202]
].flatMap(([ox, oy]) =>
  [
    [0, 0],
    [68, 0],
    [0, 68],
    [68, 68]
  ].map(([dx, dy]) => [ox + dx, oy + dy])
);

const START_ROOM = [78, 202];
const DEST_ROOM = [78, 78];

function PlateDrawing({ highlight }) {
  return (
    <>
      <rect x="140" y="0" width="60" height={PLATE} className="fill-sunken" />
      <rect x="0" y="140" width={PLATE} height="60" className="fill-sunken" />
      {ROOMS.map(([x, y]) => (
        <rect key={`${x}-${y}`} x={x} y={y} width="60" height="60" className="fill-page stroke-line" strokeWidth="1.5" />
      ))}
      {highlight && (
        <rect x={highlight[0]} y={highlight[1]} width="60" height="60" className="fill-brand-soft stroke-brand" strokeWidth="2" />
      )}
      <rect x="304" y="148" width="26" height="44" rx="3" className="fill-brand-soft stroke-brand" strokeWidth="1.5" />
      <rect x="10" y="148" width="26" height="44" rx="3" className="fill-brand-soft stroke-brand" strokeWidth="1.5" />
    </>
  );
}

function HeroStack() {
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setReady(true), 80);
    return () => clearTimeout(t);
  }, []);

  const plateStyle = (i) => ({
    transform: `translateZ(${ready ? i * GAP : i * 12}px)`
  });
  const plateClass =
    'absolute inset-0 border border-line bg-surface/85 transition-transform duration-[1400ms] ease-out motion-reduce:transition-none';

  const draw = (delay) => ({
    strokeDasharray: 1,
    strokeDashoffset: ready ? 0 : 1,
    opacity: ready ? 1 : 0,
    transition: `stroke-dashoffset 0.9s ease-out ${delay}s, opacity 0.2s ${delay}s`
  });
  const routeProps = {
    pathLength: 1,
    fill: 'none',
    strokeWidth: 5,
    strokeLinecap: 'round',
    strokeLinejoin: 'round',
    className: 'stroke-route'
  };

  const connector = (x, base, delay) => ({
    left: x - 2,
    top: 170,
    height: GAP,
    transformOrigin: '50% 0',
    transform: `translateZ(${base}px) rotateX(90deg) scaleY(${ready ? 1 : 0})`,
    transition: `transform 0.5s ease-out ${delay}s`
  });

  return (
    <div className="flex flex-col items-center">
      <div className="relative flex h-[310px] w-full items-center justify-center sm:h-[400px] xl:h-[540px]">
        <div className="scale-[0.62] sm:scale-[0.8] xl:scale-100">
          <div className="translate-y-[100px]">
            <div className="fmc-float">
              <div
                className="relative shrink-0"
                style={{
                  width: PLATE,
                  height: PLATE,
                  transformStyle: 'preserve-3d',
                  transform: 'perspective(1600px) rotateX(58deg) rotateZ(-38deg)'
                }}
                role="img"
                aria-label="Illustration of three stacked floor plans with one route climbing between them"
              >
                <div className={plateClass} style={plateStyle(0)}>
                  <svg viewBox={`0 0 ${PLATE} ${PLATE}`} className="h-full w-full" aria-hidden="true">
                    <PlateDrawing highlight={START_ROOM} />
                    <path d="M108 232 L108 170 L317 170" {...routeProps} style={draw(1.2)} />
                    <circle cx="108" cy="232" r="8" className="fill-route stroke-surface" strokeWidth="3" />
                  </svg>
                </div>

                <div className={plateClass} style={plateStyle(1)}>
                  <svg viewBox={`0 0 ${PLATE} ${PLATE}`} className="h-full w-full" aria-hidden="true">
                    <PlateDrawing />
                    <path d="M317 170 L23 170" {...routeProps} style={draw(2.5)} />
                  </svg>
                </div>

                <div className={plateClass} style={plateStyle(2)}>
                  <svg viewBox={`0 0 ${PLATE} ${PLATE}`} className="h-full w-full" aria-hidden="true">
                    <PlateDrawing highlight={DEST_ROOM} />
                    <path d="M23 170 L108 170 L108 108" {...routeProps} style={draw(3.8)} />
                    <circle
                      cx="108"
                      cy="108"
                      r="8"
                      className="fill-route stroke-surface"
                      strokeWidth="3"
                      style={{ opacity: ready ? 1 : 0, transition: 'opacity 0.3s 4.6s' }}
                    />
                  </svg>
                </div>

                <div className="absolute w-1 rounded-sm bg-route" style={connector(317, 0, 2.0)} />
                <div className="absolute w-1 rounded-sm bg-route" style={connector(23, GAP, 3.3)} />
              </div>
            </div>
          </div>
        </div>
      </div>
      <p className="text-center text-xs text-muted">Illustration: one route climbing across three floors</p>
    </div>
  );
}

function HeroSearch() {
  const [room, setRoom] = useState('');
  const navigate = useNavigate();

  const handleSubmit = (e) => {
    e.preventDefault();
    const value = room.trim();
    navigate(value ? `/search?room=${encodeURIComponent(value)}` : '/search');
  };

  return (
    <form onSubmit={handleSubmit} className="mt-9 flex max-w-lg items-end gap-4">
      <label htmlFor="hero-room" className="sr-only">
        Room number
      </label>
      <input
        id="hero-room"
        type="text"
        value={room}
        onChange={(e) => setRoom(e.target.value)}
        placeholder="Room number, e.g. 101 or 202-A"
        autoComplete="off"
        className="min-w-0 flex-1 border-0 border-b-2 border-line bg-transparent px-0 py-3 text-lg text-ink placeholder:text-muted/70 focus:border-brand focus:outline-none"
      />
      <button
        type="submit"
        className="inline-flex shrink-0 items-center justify-center gap-2 rounded-md bg-brand px-6 py-3.5 text-sm font-semibold text-brand-on transition-colors hover:bg-brand-strong"
      >
        <SearchIcon className="h-4 w-4" aria-hidden="true" />
        Search
      </button>
    </form>
  );
}

/* ---------- Sticky route walkthrough ---------- */

function ExamplePlan() {
  const rooms = [
    [40, 90],
    [140, 90],
    [240, 90],
    [340, 100]
  ];
  return (
    <>
      <rect x="20" y="20" width="440" height="260" rx="6" className="fill-surface stroke-line" strokeWidth="2" />
      <rect x="40" y="115" width="400" height="70" className="fill-sunken" />
      {rooms.map(([x, w]) => (
        <g key={x}>
          <rect x={x} y="40" width={w} height="75" className="fill-page stroke-line" strokeWidth="1.5" />
          <rect x={x} y="185" width={w} height="75" className="fill-page stroke-line" strokeWidth="1.5" />
        </g>
      ))}
      <rect x="396" y="122" width="44" height="56" rx="3" className="fill-brand-soft stroke-brand" strokeWidth="1.5" />
      <text x="418" y="138" textAnchor="middle" className="fill-brand-strong" fontSize="12" fontWeight="600">
        Stairs
      </text>
    </>
  );
}

function RoutePanel({ step }) {
  const onSecondFloor = step === 3;
  const fade = 'transition-opacity duration-500 motion-reduce:transition-none';
  const draw = 'transition-[stroke-dashoffset,opacity] duration-700 ease-out motion-reduce:transition-none';
  const drawStyle = (visible) => ({
    strokeDasharray: 1,
    strokeDashoffset: visible ? 0 : 1,
    opacity: visible ? 1 : 0
  });

  return (
    <div>
      <div className="mb-3 flex items-center justify-between text-xs text-muted">
        <span>Simplified example</span>
        <span className="font-semibold text-ink">{onSecondFloor ? 'Second floor' : 'First floor'}</span>
      </div>

      <svg
        viewBox="0 0 480 300"
        role="img"
        aria-label="Simplified floor plan showing a route along a corridor to the stairs, then continuing on the next floor"
        className="mx-auto block h-auto max-h-[30vh] w-full lg:max-h-none"
        style={{ transform: 'perspective(1100px) rotateX(8deg)', transformOrigin: '50% 100%' }}
      >
        <ExamplePlan />

        <g className={fade} style={{ opacity: onSecondFloor ? 0 : 1 }}>
          <rect x="140" y="40" width="90" height="75" className="fill-brand-soft stroke-brand" strokeWidth="1.5" />
          <path
            d="M185 115 V150 M40 150 H418"
            fill="none"
            className={`stroke-corridor ${fade}`}
            strokeWidth="3"
            strokeDasharray="7 6"
            style={{ opacity: step === 1 ? 1 : 0 }}
          />
          <text x="60" y="174" className={`fill-muted ${fade}`} fontSize="12" style={{ opacity: step === 1 ? 1 : 0 }}>
            Saved corridor lines
          </text>
          <path
            d="M185 85 L185 150 L418 150"
            pathLength="1"
            fill="none"
            className={`stroke-route ${draw}`}
            strokeWidth="4"
            strokeLinecap="round"
            strokeLinejoin="round"
            style={drawStyle(step >= 2)}
          />
          <circle cx="185" cy="85" r="8" className="fill-route stroke-surface" strokeWidth="3" />
          <text x="185" y="64" textAnchor="middle" className="fill-ink" fontSize="13" fontWeight="600">
            Start
          </text>
        </g>

        <g className={fade} style={{ opacity: onSecondFloor ? 1 : 0 }}>
          <rect x="40" y="185" width="90" height="75" className="fill-brand-soft stroke-brand" strokeWidth="1.5" />
          <path
            d="M418 150 L85 150 L85 225"
            pathLength="1"
            fill="none"
            className={`stroke-route ${draw}`}
            strokeWidth="4"
            strokeLinecap="round"
            strokeLinejoin="round"
            style={drawStyle(onSecondFloor)}
          />
          <circle cx="85" cy="225" r="8" className="fill-route stroke-surface" strokeWidth="3" />
          <text x="85" y="208" textAnchor="middle" className="fill-ink" fontSize="13" fontWeight="600">
            Destination
          </text>
        </g>
      </svg>

      <p className="mt-3 hidden min-h-[2.5rem] text-sm text-muted sm:block">{stepCaptions[step]}</p>

      <ul className="mt-3 hidden flex-wrap gap-x-5 gap-y-1 text-xs text-muted lg:flex">
        <li className="flex items-center gap-2">
          <span className="h-1 w-5 rounded-sm bg-route" />
          Route
        </li>
        <li className="flex items-center gap-2">
          <span className="w-5 border-t-2 border-dashed border-corridor" />
          Saved corridor lines
        </li>
        <li className="flex items-center gap-2">
          <span className="h-3 w-3 rounded-sm border border-brand bg-brand-soft" />
          Stairs and rooms on the route
        </li>
      </ul>

      <div className="mt-4 flex gap-1.5" aria-hidden="true">
        {steps.map((_, i) => (
          <span key={i} className={`h-1 flex-1 rounded-sm transition-colors ${i <= step ? 'bg-brand' : 'bg-line'}`} />
        ))}
      </div>
    </div>
  );
}

/**
 * Sticky walkthrough. The panel stays in view while the steps scroll past.
 * One IntersectionObserver updates the active step, so there is no scroll listener.
 */
function RouteWalkthrough() {
  const [active, setActive] = useState(0);
  const stepRefs = useRef([]);

  useEffect(() => {
    if (typeof IntersectionObserver === 'undefined') return undefined;
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) setActive(Number(entry.target.dataset.index));
        });
      },
      { rootMargin: '-45% 0px -45% 0px' }
    );
    stepRefs.current.forEach((el) => {
      if (el) observer.observe(el);
    });
    return () => observer.disconnect();
  }, []);

  return (
    <section aria-labelledby="walkthrough-heading">
      <div className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8">
        <div className="max-w-2xl">
          <h2 id="walkthrough-heading" className="font-display text-4xl font-bold tracking-tight text-ink sm:text-5xl">
            How a route is built
          </h2>
          <p className="mt-4 text-lg text-muted">
            Scroll through the four steps. The example beside them shows what happens on the map.
          </p>
        </div>

        <div className="mt-12 flex flex-col gap-4 lg:grid lg:grid-cols-2 lg:gap-x-16 lg:gap-y-0">
          <div className="sticky top-[65px] z-10 bg-page py-3 lg:top-28 lg:col-start-2 lg:row-span-4 lg:row-start-1 lg:self-start lg:bg-transparent lg:py-0">
            <RoutePanel step={active} />
          </div>

          {steps.map((step, i) => (
            <article
              key={step.title}
              ref={(el) => {
                stepRefs.current[i] = el;
              }}
              data-index={i}
              className="flex min-h-[40vh] items-center lg:col-start-1 lg:min-h-[58vh]"
            >
              <div
                className={`border-l-2 pl-6 transition-colors duration-300 motion-reduce:transition-none ${
                  i === active ? 'border-brand' : 'border-line'
                }`}
              >
                <p className="text-sm font-semibold text-brand-strong">
                  Step {i + 1} of {steps.length}
                </p>
                <h3 className="mt-2 font-display text-3xl font-bold text-ink sm:text-4xl">{step.title}</h3>
                <p className="mt-3 max-w-md text-lg leading-relaxed text-muted">{step.text}</p>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ---------- Page ---------- */

export default function Home() {
  return (
    <div className="home-page overflow-x-clip text-ink">
      <section>
        <div className="mx-auto grid max-w-7xl items-center gap-6 px-4 pb-12 pt-12 sm:px-6 lg:grid-cols-[1.05fr_0.95fr] lg:gap-10 lg:px-8 lg:pb-20 lg:pt-16">
          <div>
            <h1 className="font-display text-5xl font-bold leading-[0.95] tracking-tight text-ink sm:text-6xl lg:text-7xl">
              Stop circling the corridors.
              <span className="block text-brand-strong">Walk straight to your classroom.</span>
            </h1>
            <p className="mt-6 max-w-xl text-lg leading-relaxed text-muted">
              Search a room, follow the blue line, change floors at the stairs. Find My Class turns the LGU floor plans
              into a route you can actually walk.
            </p>
            <HeroSearch />
            <p className="mt-8 text-sm text-muted">Jump straight to a floor</p>
            <ul className="mt-2 flex max-w-xl flex-wrap gap-x-5 gap-y-2">
              {campusMaps.map((map) => (
                <li key={map.id}>
                  <Link
                    to="/map"
                    state={{ selectMapId: map.id }}
                    className="inline-block border-b border-line pb-0.5 text-sm font-medium text-ink transition-colors hover:border-brand hover:text-brand-strong"
                  >
                    {map.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <HeroStack />
        </div>
      </section>

      <section aria-labelledby="features-heading">
        <div className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8">
          <h2 id="features-heading" className="max-w-3xl font-display text-4xl font-bold tracking-tight text-ink sm:text-5xl">
            Made for the walk between classes.
          </h2>
          <ul className="mt-12 divide-y divide-line border-y border-line">
            {features.map(({ icon: Icon, title, text }) => (
              <li key={title} className="grid gap-3 py-8 md:grid-cols-[20rem_1fr] md:items-center md:gap-10">
                <div className="flex items-center gap-4">
                  <Icon className="h-7 w-7 shrink-0 text-brand-strong" aria-hidden="true" />
                  <h3 className="font-display text-3xl font-bold text-ink">{title}</h3>
                </div>
                <p className="max-w-xl text-lg leading-relaxed text-muted">{text}</p>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <RouteWalkthrough />

      <section aria-labelledby="cta-heading">
        <div className="mx-auto max-w-7xl px-4 pb-24 pt-8 sm:px-6 lg:px-8">
          <h2 id="cta-heading" className="max-w-4xl font-display text-5xl font-bold leading-[0.98] tracking-tight text-ink sm:text-6xl lg:text-7xl">
            Your next class is somewhere on this campus. <span className="text-brand-strong">Go find it.</span>
          </h2>
          <div className="mt-10 flex flex-wrap items-center gap-x-8 gap-y-4">
            <Link
              to="/search"
              className="inline-flex items-center gap-2 rounded-md bg-brand px-7 py-3.5 text-base font-semibold text-brand-on transition-colors hover:bg-brand-strong"
            >
              <SearchIcon className="h-5 w-5" aria-hidden="true" />
              Search a room
            </Link>
            <Link
              to="/map"
              className="inline-block border-b-2 border-brand pb-0.5 text-base font-semibold text-ink transition-colors hover:text-brand-strong"
            >
              Open the campus map
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}

