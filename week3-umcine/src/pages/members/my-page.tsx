import { useQueries } from "@tanstack/react-query";
import { Link } from "@tanstack/react-router";
import { useState } from "react";
import { getMovieDetail } from "@/api/movies/get-movie-detail";
import type { TmdbMovieDetail } from "@/api/movies/models";
import Pagination from "@/components/movies/pagination";
import { useBookmarkStore } from "@/stores/bookmark-store";
import { cn } from "@/utils/cn";
import { getTmdbPosterUrl } from "@/utils/movies/tmdb-image";

// 내 정보 API 연동 전까지 사용할 기본 프로필
const DEFAULT_PROFILE = {
  nickname: "gs0428",
  email: "gwangsoo@cinemalab.kr",
};

const FAVORITES_PER_PAGE = 5;

export function MyPage() {
  const [profile, setProfile] = useState(DEFAULT_PROFILE);
  const [isEditing, setIsEditing] = useState(false);
  const [nicknameDraft, setNicknameDraft] = useState(profile.nickname);

  const isNicknameValid =
    nicknameDraft.trim().length >= 2 && nicknameDraft.trim().length <= 12;

  const handleStartEdit = () => {
    setNicknameDraft(profile.nickname);
    setIsEditing(true);
  };

  const handleCancelEdit = () => {
    setIsEditing(false);
  };

  const handleSubmit = (e: React.SubmitEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!isNicknameValid) return;

    // 내 정보 수정 API 연동 전까지 화면 상태만 바꿈
    setProfile((prev) => ({ ...prev, nickname: nicknameDraft.trim() }));
    setIsEditing(false);
  };

  return (
    <main className="flex flex-1 flex-col gap-7 bg-[#F6F7F9] px-20 py-6">
      <div className="flex items-center justify-between">
        <h1 className="text-[31px] font-bold leading-[37px] tracking-[-1.24px] text-[#17191E]">
          내 정보
        </h1>
        {isEditing ? (
          <div className="flex items-center gap-2.5">
            <button
              type="button"
              onClick={handleCancelEdit}
              className="h-[42px] rounded-lg border border-[#E3E6EB] bg-white px-4 text-sm font-extrabold text-[#17191E]"
            >
              취소
            </button>
            <button
              type="submit"
              form="profile-form"
              disabled={!isNicknameValid}
              className="h-[42px] rounded-lg border border-white bg-[#2563EB] px-4 text-sm font-extrabold text-white disabled:cursor-not-allowed disabled:opacity-40"
            >
              저장
            </button>
          </div>
        ) : (
          <button
            type="button"
            onClick={handleStartEdit}
            className="h-[42px] rounded-lg border border-white bg-[#2563EB] px-4 text-sm font-extrabold text-white"
          >
            정보 수정
          </button>
        )}
      </div>

      <section className="flex flex-col gap-4 border-y border-[#E3E6EB] py-3">
        <h2 className="text-[17px] font-bold leading-5 text-[#17191E]">기본 정보</h2>
        <div className="flex items-center gap-7">
          <span className="flex h-[82px] w-[82px] shrink-0 items-center justify-center rounded-full bg-[#E3E6EB]">
            <img src="/icons/person.svg" alt="" className="h-12 w-12" />
          </span>

          {isEditing ? (
            <form
              id="profile-form"
              onSubmit={handleSubmit}
              noValidate
              className="flex w-full max-w-[760px] items-start gap-7"
            >
              <div className="flex flex-1 flex-col gap-1.5">
                <label htmlFor="profile-nickname" className={infoLabelClassName}>
                  닉네임
                </label>
                <input
                  id="profile-nickname"
                  value={nicknameDraft}
                  onChange={(e) => setNicknameDraft(e.target.value)}
                  placeholder="2–12자"
                  className={cn(
                    "h-10 rounded-lg border bg-white px-3 text-sm font-bold text-[#17191E] outline-none placeholder:font-normal placeholder:text-[#969DA8]",
                    isNicknameValid
                      ? "border-[#E3E6EB] focus:border-[#17191E]"
                      : "border-red-500",
                  )}
                />
                {!isNicknameValid && (
                  <p className="text-[11px] leading-[13px] text-red-500">
                    닉네임은 2자 이상 12자 이하로 입력해 주세요.
                  </p>
                )}
              </div>
              <div className="flex flex-1 flex-col gap-1.5">
                <span className={infoLabelClassName}>이메일</span>
                {/* 이메일은 로그인 계정이라 수정하지 않음 */}
                <strong className="flex h-10 items-center text-sm font-bold text-[#969DA8]">
                  {profile.email}
                </strong>
              </div>
            </form>
          ) : (
            <div className="flex w-full max-w-[760px] items-start gap-7">
              <InfoItem label="닉네임" value={profile.nickname} />
              <InfoItem label="이메일" value={profile.email} />
            </div>
          )}
        </div>
      </section>

      <FavoriteMovies />
    </main>
  );
}

const infoLabelClassName = "text-[11px] leading-[13px] text-[#969DA8]";

function InfoItem({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex flex-1 flex-col gap-1.5">
      <span className={infoLabelClassName}>{label}</span>
      <strong className="text-sm font-bold leading-[17px] text-[#17191E]">{value}</strong>
    </div>
  );
}

// 북마크한 영화의 상세 정보를 불러와 페이지별로 보여줌
function FavoriteMovies() {
  const bookmarkedMovieIds = useBookmarkStore((state) => state.bookmarkedMovieIds);
  const [page, setPage] = useState(1);

  const totalPages = Math.ceil(bookmarkedMovieIds.length / FAVORITES_PER_PAGE);
  // 북마크를 해제해 현재 페이지가 사라지면 마지막 페이지를 보여줌
  const currentPage = Math.min(page, Math.max(totalPages, 1));
  const pageMovieIds = bookmarkedMovieIds.slice(
    (currentPage - 1) * FAVORITES_PER_PAGE,
    currentPage * FAVORITES_PER_PAGE,
  );

  // 상세 페이지와 같은 queryKey를 사용해 캐시를 함께 씀
  const movieQueries = useQueries({
    queries: pageMovieIds.map((movieId) => ({
      queryKey: ["movies", "detail", movieId],
      queryFn: () => getMovieDetail(movieId),
    })),
  });

  return (
    <section className="flex flex-col gap-4">
      <h2 className="text-[17px] font-bold leading-5 text-[#17191E]">내 즐겨찾기</h2>
      {bookmarkedMovieIds.length === 0 ? (
        <p className="py-10 text-sm text-[#606774]">아직 즐겨찾기한 영화가 없어요.</p>
      ) : (
        <>
          <ul className="grid grid-cols-2 gap-[18px] sm:grid-cols-3 lg:grid-cols-5">
            {movieQueries.map((query, index) => (
              <li key={pageMovieIds[index]}>
                {query.isPending ? (
                  <div className="h-[274px] animate-pulse rounded-[10px] bg-[#E3E6EB]" />
                ) : query.isError ? (
                  <div className="flex h-[274px] items-center justify-center rounded-[10px] bg-white text-xs text-red-500">
                    영화 정보를 불러오지 못했어요.
                  </div>
                ) : (
                  <FavoriteMovieCard movie={query.data} />
                )}
              </li>
            ))}
          </ul>
          <Pagination page={currentPage} totalPages={totalPages} onPageChange={setPage} />
        </>
      )}
    </section>
  );
}

function FavoriteMovieCard({ movie }: { movie: TmdbMovieDetail }) {
  const posterUrl = getTmdbPosterUrl(movie.poster_path);

  return (
    <article>
      <Link
        to="/movies/$movieId"
        params={{ movieId: String(movie.id) }}
        className="flex flex-col gap-1"
      >
        <div className="h-[274px] overflow-hidden rounded-[10px] bg-[#F6F7F9]">
          {posterUrl && (
            <img
              src={posterUrl}
              alt={`${movie.title} 포스터`}
              className="h-full w-full object-cover"
            />
          )}
        </div>
        <h3 className="truncate pt-[5px] text-sm font-extrabold leading-[17px] text-[#17191E]">
          {movie.title}
        </h3>
        <p className="text-xs leading-[14px] text-[#969DA8]">
          {movie.release_date.replaceAll("-", ".")}
        </p>
      </Link>
    </article>
  );
}
