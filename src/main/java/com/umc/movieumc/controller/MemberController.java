package com.umc.movieumc.controller;

import com.umc.movieumc.dto.*;
import com.umc.movieumc.interceptor.AuthInterceptor;
import com.umc.movieumc.service.MemberService;
import com.umc.movieumc.config.SwaggerConfig;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.media.ExampleObject;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequiredArgsConstructor
@RequestMapping("/members")
@Tag(name = "회원", description = "회원가입과 내 정보 API")
public class MemberController {

    private final MemberService memberService;

    @Operation(
            summary = "닉네임 중복 확인",
            description = "회원가입 전에 닉네임을 쓸 수 있는지 확인합니다. 🔓 토큰 없이 호출할 수 있는 공개 API입니다."
    )
    @GetMapping("/nickname/{nickname}")
    public NicknameCheckResponse checkNickname(
            @Parameter(description = "확인할 닉네임", example = "영화광") @PathVariable String nickname
    ) {
        return memberService.checkNickname(nickname);
    }

    @Operation(
            summary = "이메일 중복 확인",
            description = "회원가입 전에 이메일을 쓸 수 있는지 확인합니다. 🔓 토큰 없이 호출할 수 있는 공개 API입니다."
    )
    @GetMapping("/email/{email}")
    public EmailCheckResponse checkEmail(
            @Parameter(description = "확인할 이메일", example = "umc@example.com") @PathVariable String email
    ) {
        return memberService.checkEmail(email);
    }
    
    @Operation(
            summary = "회원가입",
            description = "이메일, 비밀번호, 닉네임으로 회원을 등록합니다. 토큰이 없어도 호출할 수 있는 공개 API입니다."
    )
    @PostMapping
    public ResponseEntity<ApiResponse<MemberResponse>> signUp(
            @Valid @RequestBody SignUpRequest request
    ) {
        MemberResponse response = memberService.signUp(request);
        return ResponseEntity.status(201)
                .body(ApiResponse.created("회원가입에 성공했습니다.", response));
    }

    @Operation(
            summary = "내 정보 조회",
            description = """
                    토큰의 주인인 회원의 이메일, 닉네임, 가입일을 조회합니다.
                    🔒 Access Token이 필요합니다.
                    """
    )
    @SecurityRequirement(name = SwaggerConfig.BEARER_AUTH)
    @ApiResponses({
            @io.swagger.v3.oas.annotations.responses.ApiResponse(
                    responseCode = "200", description = "내 정보 조회 성공",
                    content = @Content(mediaType = "application/json", examples = @ExampleObject(value = """
                            {
                              "isSuccess": true,
                              "code": "COMMON200",
                              "message": "회원 정보를 조회했습니다.",
                              "result": {
                                "email": "umc@example.com",
                                "nickname": "영화광",
                                "createdAt": "2026-09-01T12:00:00"
                              }
                            }
                            """))),
            @io.swagger.v3.oas.annotations.responses.ApiResponse(
                    responseCode = "401", description = "토큰이 없거나 유효하지 않음",
                    content = @Content(mediaType = "application/json", examples = @ExampleObject(value = """
                            {
                              "isSuccess": false,
                              "code": "AUTH401_2",
                              "message": "로그인이 필요한 요청입니다.",
                              "result": null
                            }
                            """))),
            @io.swagger.v3.oas.annotations.responses.ApiResponse(
                    responseCode = "404", description = "토큰의 회원이 존재하지 않음 (탈퇴 등)",
                    content = @Content(mediaType = "application/json", examples = @ExampleObject(value = """
                            {
                              "isSuccess": false,
                              "code": "MEMBER404_1",
                              "message": "해당 회원을 찾을 수 없습니다.",
                              "result": null
                            }
                            """)))
    })
    @GetMapping("/me")
    public ResponseEntity<ApiResponse<MemberInfoResponse>> getMyInfo(
            // 인터셉터가 request.setAttribute("memberId", ...)로 담아둔 값을 꺼냅니다
            // 클라이언트가 보내는 값이 아니므로 Swagger 화면에서는 숨깁니다
            @Parameter(hidden = true) @RequestAttribute(AuthInterceptor.MEMBER_ID) Long memberId
    ) {
        MemberInfoResponse response = memberService.getMyInfo(memberId);
        return ResponseEntity.ok(ApiResponse.ok("회원 정보를 조회했습니다.", response));
    }

    @Operation(
            summary = "내 정보 수정",
            description = """
                    토큰의 주인인 회원의 닉네임(2~12자)을 수정합니다. 다른 회원이 쓰는 닉네임으로는 바꿀 수 없습니다.
                    🔒 Access Token이 필요합니다.
                    """
    )
    @SecurityRequirement(name = SwaggerConfig.BEARER_AUTH)
    @ApiResponses({
            @io.swagger.v3.oas.annotations.responses.ApiResponse(
                    responseCode = "200", description = "내 정보 수정 성공",
                    content = @Content(mediaType = "application/json", examples = @ExampleObject(value = """
                            {
                              "isSuccess": true,
                              "code": "COMMON200",
                              "message": "회원 정보를 수정했습니다.",
                              "result": {
                                "email": "umc@example.com",
                                "nickname": "새닉네임",
                                "createdAt": "2026-09-01T12:00:00"
                              }
                            }
                            """))),
            @io.swagger.v3.oas.annotations.responses.ApiResponse(
                    responseCode = "400", description = "닉네임 검증 실패",
                    content = @Content(mediaType = "application/json", examples = @ExampleObject(value = """
                            {
                              "isSuccess": false,
                              "code": "COMMON4001",
                              "message": "닉네임은 2자 이상 12자 이하여야 합니다.",
                              "result": null
                            }
                            """))),
            @io.swagger.v3.oas.annotations.responses.ApiResponse(
                    responseCode = "401", description = "토큰이 없거나 유효하지 않음",
                    content = @Content(mediaType = "application/json", examples = @ExampleObject(value = """
                            {
                              "isSuccess": false,
                              "code": "AUTH401_2",
                              "message": "로그인이 필요한 요청입니다.",
                              "result": null
                            }
                            """))),
            @io.swagger.v3.oas.annotations.responses.ApiResponse(
                    responseCode = "409", description = "이미 사용 중인 닉네임",
                    content = @Content(mediaType = "application/json", examples = @ExampleObject(value = """
                            {
                              "isSuccess": false,
                              "code": "MEMBER409_1",
                              "message": "이미 사용 중인 닉네임입니다.",
                              "result": null
                            }
                            """)))
    })
    @PatchMapping("/me")
    public ResponseEntity<ApiResponse<MemberInfoResponse>> updateMyInfo(
            @Parameter(hidden = true) @RequestAttribute(AuthInterceptor.MEMBER_ID) Long memberId,
            @RequestBody @Valid MemberUpdateRequest request
    ) {
        MemberInfoResponse response = memberService.updateMyInfo(memberId, request);
        return ResponseEntity.ok(ApiResponse.ok("회원 정보를 수정했습니다.", response));
    }

}