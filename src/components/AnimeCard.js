import Link from "next/link";

export default function AnimeCard({ id, title, image, episodeNumber, releaseDate, subOrDub, server }) {
  // If id is not formatted, make sure it is safe
  const animeLink = `/anime/${encodeURIComponent(id)}${server ? `?server=${server}` : ""}`;

  return (
    <Link href={animeLink} style={{ textDecoration: "none", color: "inherit" }}>
      <div className="anime-card" style={{
        display: "flex",
        flexDirection: "column",
        gap: "10px",
        cursor: "pointer",
        transition: "var(--transition-smooth)",
      }}>
        {/* Poster Wrapper */}
        <div style={{
          position: "relative",
          width: "100%",
          aspectRatio: "2/3",
          borderRadius: "var(--border-radius-md)",
          overflow: "hidden",
          border: "1px solid var(--glass-border)",
          backgroundColor: "var(--bg-secondary)",
          transition: "var(--transition-smooth)"
        }} className="poster-wrapper">
          
          {/* Image */}
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img 
            src={image} 
            alt={title} 
            style={{
              width: "100%",
              height: "100%",
              objectFit: "cover",
              transition: "var(--transition-smooth)"
            }}
            className="poster-img"
            loading="lazy"
          />

          {/* Badges Overlay */}
          <div style={{
            position: "absolute",
            top: "8px",
            left: "8px",
            display: "flex",
            flexDirection: "column",
            gap: "4px",
            zIndex: 1
          }}>
            {episodeNumber && (
              <span className="badge badge-cyan">
                EP {episodeNumber}
              </span>
            )}
            {subOrDub && subOrDub !== "SUB" && (
              <span className="badge badge-pink">
                {subOrDub}
              </span>
            )}
          </div>
        </div>

        {/* Info */}
        <div style={{ padding: "2px 4px" }}>
          <h3 style={{
            fontSize: "0.95rem",
            fontWeight: 600,
            lineHeight: "1.3",
            height: "2.6em",
            overflow: "hidden",
            display: "-webkit-box",
            WebkitLineClamp: 2,
            WebkitBoxOrient: "vertical",
            transition: "var(--transition-smooth)"
          }} className="anime-title">
            {title}
          </h3>
          {releaseDate && (
            <span style={{
              fontSize: "0.75rem",
              color: "var(--foreground-muted)",
              marginTop: "4px",
              display: "block"
            }}>
              {releaseDate}
            </span>
          )}
        </div>
      </div>

      {/* Hover Animations */}
      <style jsx>{`
        .anime-card:hover .poster-wrapper {
          transform: translateY(-5px);
          border-color: var(--accent-cyan);
          box-shadow: var(--shadow-glow);
        }
        .anime-card:hover .poster-img {
          transform: scale(1.05);
        }
        .anime-card:hover .anime-title {
          color: var(--accent-cyan);
        }
      `}</style>
    </Link>
  );
}
