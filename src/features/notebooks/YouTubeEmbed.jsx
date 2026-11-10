/** Vídeo incorporado (youtube-nocookie) com link de saída. `id` já validado por parseYouTubeId. */
export default function YouTubeEmbed({ id, title }) {
  return (
    <div className="yt-wrap">
      <div className="yt-frame">
        <iframe
          src={`https://www.youtube-nocookie.com/embed/${id}`}
          title={`Vídeo: ${title}`}
          loading="lazy"
          allow="accelerometer; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
          referrerPolicy="strict-origin-when-cross-origin"
        />
      </div>
      <a href={`https://www.youtube.com/watch?v=${id}`} target="_blank" rel="noopener noreferrer">
        Abrir no YouTube
      </a>
    </div>
  )
}
