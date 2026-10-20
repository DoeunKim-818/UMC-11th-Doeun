package com.umc.movieumc.dto;

public record MemberResponse(
        Long memberId,
        String email,
        String nickname
) {}
