import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { getMovies } from "../../api/movies/get-movies";
import MovieGrid from "../../components/movies/movie-grid";
import Pagination from "../../components/movies/pagination";

export function MovieListPage() {
  const [page, setPage] = useState(1);

  const moviesQuery = useQuery({
    queryKey: ["movies", "list", { page }],
    queryFn: () => getMovies({ page }),
  });

  const movies = moviesQuery.data?.results ?? [];
  const totalPages = moviesQuery.data?.total_pages ?? 0;

  const handlePageChange = (nextPage: number) => {
    setPage(nextPage);
  };

  return (
    <main className="mx-auto w-full max-w-6xl flex-1 px-8 py-8">
      <h1 className="mb-6 text-3xl font-bold text-[#17191E]">영화 목록</h1>
      {moviesQuery.isPending ? (
        <p>로딩 중...</p>
      ) : moviesQuery.isError ? (
        <p className="text-red-500">영화 목록을 불러오지 못했어요.</p>
      ) : movies.length === 0 ? (
        <p className="text-[#606774]">표시할 영화가 없어요.</p>
      ) : (
        <>
          <MovieGrid movies={movies} />
          <Pagination
            page={page}
            totalPages={totalPages}
            onPageChange={handlePageChange}
          />
        </>
      )}
    </main>
  );
}
