import { useQuery } from "@tanstack/react-query";
import { Link, useParams } from "@tanstack/react-router";
import { getMovieDetail } from "../../api/movies/get-movie-detail";
import { BookmarkButton } from "../../components/bookmark-button";
import { getMovieDetailErrorMessage } from "../../utils/movies/get-movie-detail-error-message";
import {
  getTmdbBackdropUrl,
  getTmdbPosterUrl,
} from "../../utils/movies/tmdb-image";

function formatRuntime(runtime: number | null) {
  if (typeof runtime !== "number" || runtime <= 0) {
    return "상영 시간 정보가 없어요.";
  }

  const hours = Math.floor(runtime / 60);
  const minutes = runtime % 60;

  if (hours === 0) return `${minutes}분`;
  if (minutes === 0) return `${hours}시간`;
  return `${hours}시간 ${minutes}분`;
}

export function MovieDetailPage() {
  const { movieId: movieIdParam } = useParams({ from: "/movies/$movieId" });
  const movieId = Number(movieIdParam);
  const isValidMovieId = Number.isInteger(movieId) && movieId > 0;

  const movieDetailQuery = useQuery({
    queryKey: ["movies", "detail", movieId],
    queryFn: () => getMovieDetail(movieId),
    enabled: isValidMovieId,
    staleTime: 30 * 1000,
  });

  if (!isValidMovieId) {
    return (
      <main className="flex flex-1 items-center justify-center text-[#606774]">
        올바르지 않은 영화 번호예요.
      </main>
    );
  }

  if (movieDetailQuery.isPending) {
    return (
      <main className="flex flex-1 items-center justify-center text-[#606774]">
        로딩 중...
      </main>
    );
  }

  if (movieDetailQuery.isError) {
    return (
      <main className="flex flex-1 items-center justify-center text-[#606774]">
        {getMovieDetailErrorMessage(movieDetailQuery.error)}
      </main>
    );
  }

  const movie = movieDetailQuery.data;
  const backdropUrl = getTmdbBackdropUrl(movie.backdrop_path);
  const posterUrl = getTmdbPosterUrl(movie.poster_path);
  const genreText = movie.genres.map((genre) => genre.name).join(", ");

  return (
    <main className="flex flex-1 flex-col">
      <div className="relative h-80 w-full overflow-hidden bg-[#17191E] sm:h-96">
        {backdropUrl && (
          <img
            src={backdropUrl}
            alt=""
            aria-hidden="true"
            className="h-full w-full object-cover"
          />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-white via-black/10 to-transparent" />
        <div className="absolute inset-x-0 bottom-0 mx-auto w-full max-w-6xl px-8 pb-6">
          <Link
            to="/"
            className="mb-4 inline-flex items-center gap-1 text-sm text-white hover:text-gray-200"
          >
            <img src="/icons/chevron-left.svg" alt="" className="h-4 w-4 invert" />
            목록으로
          </Link>
          <h1 className="text-3xl font-bold text-white sm:text-4xl">{movie.title}</h1>
        </div>
      </div>

      <div className="mx-auto w-full max-w-6xl px-8 py-6">
        <p className="text-sm text-[#606774]">{movie.original_title}</p>
        <p className="mt-1 text-sm text-[#606774]">
          {[genreText, movie.release_date, formatRuntime(movie.runtime)]
            .filter(Boolean)
            .join(" · ")}
        </p>

        <div className="mt-8 grid grid-cols-1 gap-6 lg:grid-cols-[1fr_320px]">
          <div className="flex gap-5 rounded-xl border border-[#E3E6EB] bg-white p-5">
            <div className="h-44 w-32 flex-shrink-0 overflow-hidden rounded-lg bg-[#F6F7F9]">
              {posterUrl && (
                <img
                  src={posterUrl}
                  alt={`${movie.title} 포스터`}
                  className="h-full w-full object-cover"
                />
              )}
            </div>
            <div className="flex flex-col gap-3">
              {movie.tagline && (
                <h2 className="font-semibold text-[#17191E]">{movie.tagline}</h2>
              )}
              <p className="text-sm text-[#606774]">{movie.overview}</p>
              <BookmarkButton movieId={movie.id} />
            </div>
          </div>

          <div className="rounded-xl border border-[#E3E6EB] bg-white p-5">
            <h2 className="mb-3 font-semibold text-[#17191E]">내 평점</h2>
            <div className="mb-4 flex gap-1">
              {[1, 2, 3, 4, 5].map((n) => (
                <img key={n} src="/icons/star-outline.svg" alt="" className="h-5 w-5" />
              ))}
            </div>
            <textarea
              placeholder="리뷰를 남겨보세요"
              className="h-24 w-full resize-none rounded-lg border border-[#E3E6EB] bg-white p-3 text-sm text-[#17191E] placeholder:text-[#9AA1AC] outline-none"
            />
            <button className="mt-3 w-full rounded-lg bg-[#17191E] py-2 text-sm font-semibold text-white hover:bg-[#2b2e37]">
              리뷰 저장
            </button>
          </div>
        </div>
      </div>
    </main>
  );
}
