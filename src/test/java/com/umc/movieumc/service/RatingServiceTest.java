package com.umc.movieumc.service;

import com.umc.movieumc.dto.CreateRatingRequest;
import com.umc.movieumc.dto.UpdateRatingRequest;
import com.umc.movieumc.entity.Member;
import com.umc.movieumc.entity.Rating;
import com.umc.movieumc.exception.ApiException;
import com.umc.movieumc.repository.MemberRepository;
import com.umc.movieumc.repository.RatingRepository;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.test.util.ReflectionTestUtils;

import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.BDDMockito.given;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;

@ExtendWith(MockitoExtension.class)
class RatingServiceTest {

    @Mock
    private RatingRepository ratingRepository;

    @Mock
    private MemberRepository memberRepository;

    @InjectMocks
    private RatingService ratingService;

    private final Member member = Member.builder()
            .email("challenger@umc.com")
            .password("암호화된비밀번호")
            .nickname("영화조아")
            .build();

    @Test
    @DisplayName("이미 평점을 남긴 영화에 다시 등록하면 RATING409_1 예외를 던지고 저장하지 않는다")
    void createRatingWhenDuplicated() {
        // given: 회원은 존재하고, 같은 영화에 이미 평점을 남긴 상황
        given(memberRepository.findById(1L)).willReturn(Optional.of(member));
        given(ratingRepository.existsByMember_MemberIdAndMovieId(1L, 550L)).willReturn(true);

        // when & then: RATING409_1 예외가 나고, 저장은 시도조차 하지 않는다
        assertThatThrownBy(() -> ratingService.create(1L, new CreateRatingRequest(550L, 5, "또 보고 싶어요")))
                .isInstanceOf(ApiException.class)
                .hasMessage("이미 이 영화에 평점을 남기셨습니다.")
                .extracting("code").isEqualTo("RATING409_1");

        verify(ratingRepository, never()).save(any(Rating.class));
    }

    @Test
    @DisplayName("남의 평점을 수정하려 하면 RATING403_1 예외를 던지고 내용은 바뀌지 않는다")
    void updateOthersRating() {
        // given: 2번 회원이 남긴 평점을 1번 회원이 수정하려는 상황
        // 빌더로 만든 엔티티는 DB를 거치지 않아 ID가 비어 있으므로 직접 넣어줍니다
        ReflectionTestUtils.setField(member, "memberId", 2L);
        Rating othersRating = Rating.builder()
                .member(member)
                .movieId(550L)
                .score(5)
                .comment("원래 후기")
                .build();
        given(ratingRepository.findById(10L)).willReturn(Optional.of(othersRating));

        // when & then: RATING403_1 예외가 나고, 저장도 되지 않으며 기존 값이 그대로 남는다
        assertThatThrownBy(() -> ratingService.update(1L, 10L, new UpdateRatingRequest(1, "몰래 바꾼 후기")))
                .isInstanceOf(ApiException.class)
                .hasMessage("본인이 작성한 평점만 수정하거나 삭제할 수 있습니다.")
                .extracting("code").isEqualTo("RATING403_1");

        verify(ratingRepository, never()).save(any(Rating.class));
        assertThat(othersRating.getScore()).isEqualTo(5);
        assertThat(othersRating.getComment()).isEqualTo("원래 후기");
    }
}
