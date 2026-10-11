interface BoxProps {
  width?: string | number;
  height?: string | number;
  rounded?: boolean;
  className?: string;
}

/** Un simple rectangle animé — brique de base des squelettes. */
export function SkeletonBox({ width = "100%", height = 20, rounded = false, className = "" }: BoxProps) {
  return (
    <div
      className={`skeleton ${className}`}
      style={{ width, height, borderRadius: rounded ? "50%" : 8 }}
    />
  );
}

/** Squelette pour un écran de liste (cartes mobiles + tableau desktop). */
export function ListSkeleton({ rows = 5 }: { rows?: number }) {
  return (
    <>
      <div className="d-md-none">
        {Array.from({ length: Math.min(rows, 3) }).map((_, i) => (
          <div key={i} className="card border-0 shadow-sm mb-4 rounded-4 p-4">
            <div className="d-flex align-items-center mb-3">
              <SkeletonBox width={60} height={60} rounded className="me-3" />
              <div className="flex-grow-1">
                <SkeletonBox width="60%" height={20} className="mb-2" />
                <SkeletonBox width="40%" height={15} />
              </div>
            </div>
            <SkeletonBox height={35} />
          </div>
        ))}
      </div>
      <div className="card border-0 shadow-sm d-none d-md-block rounded-4 overflow-hidden bg-white">
        <div className="p-4">
          {Array.from({ length: rows }).map((_, i) => (
            <div key={i} className="d-flex align-items-center mb-4">
              <SkeletonBox width={45} height={45} rounded className="me-3" />
              <div className="flex-grow-1 me-4">
                <SkeletonBox height={20} />
              </div>
              <div className="flex-grow-1 me-4">
                <SkeletonBox height={20} />
              </div>
              <div style={{ width: 120 }}>
                <SkeletonBox height={20} />
              </div>
            </div>
          ))}
        </div>
      </div>
    </>
  );
}

/** Squelette pour un écran de formulaire (create/edit). */
export function FormSkeleton({ fields = 4 }: { fields?: number }) {
  return (
    <div className="row g-4">
      <div className="col-12 col-lg-8">
        <div className="card border-0 shadow-sm p-4 rounded-4">
          <SkeletonBox width="40%" height={24} className="mb-4" />
          <div className="row g-3">
            {Array.from({ length: fields }).map((_, i) => (
              <div key={i} className="col-md-6">
                <SkeletonBox width="30%" height={15} className="mb-2" />
                <SkeletonBox height={40} />
              </div>
            ))}
          </div>
        </div>
      </div>
      <div className="col-12 col-lg-4">
        <div className="card border-0 shadow-sm p-4 rounded-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="mb-3">
              <SkeletonBox width="50%" height={15} className="mb-2" />
              <SkeletonBox height={40} />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
