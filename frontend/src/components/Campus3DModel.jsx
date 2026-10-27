import { useEffect, useRef, useState } from 'react';

const MODEL_VIEWER_SRC =
  'https://unpkg.com/@google/model-viewer@4.0.0/dist/model-viewer.min.js';

export default function Campus3DModel({ src }) {
  const viewerRef = useRef(null);
  const [viewerReady, setViewerReady] = useState(
    () => Boolean(window.customElements?.get('model-viewer'))
  );

  useEffect(() => {
    if (window.customElements?.get('model-viewer')) {
      setViewerReady(true);
      return undefined;
    }

    const existing = document.querySelector(`script[src="${MODEL_VIEWER_SRC}"]`);
    const script = existing || document.createElement('script');
    script.type = 'module';
    script.src = MODEL_VIEWER_SRC;
    script.async = true;

    const markReady = () => setViewerReady(true);
    script.addEventListener('load', markReady, { once: true });
    if (!existing) document.head.appendChild(script);

    return () => script.removeEventListener('load', markReady);
  }, []);

  return (
    <div className="campus-3d-viewer" aria-label="Interactive 3D campus model">
      {!viewerReady && (
        <div className="campus-3d-loading" role="status">
          Loading 3D campus model…
        </div>
      )}
      {viewerReady && (
        <model-viewer
          ref={viewerRef}
          src={src}
          alt="Interactive 3D model of the campus"
          camera-controls=""
          touch-action="pan-y"
          shadow-intensity="1"
          exposure="1"
          environment-image="neutral"
          interaction-prompt="auto"
          ar=""
          loading="eager"
        />
      )}
      <p className="campus-3d-caption">
        Drag to rotate, scroll to zoom, and use the map dropdown to return to a floor plan.
      </p>
    </div>
  );
}
