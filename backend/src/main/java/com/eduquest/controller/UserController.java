// backend/src/main/java/com/eduquest/controller/UserController.java
package com.eduquest.controller;

import com.eduquest.dto.ApiResponse;
import com.eduquest.dto.UpdateProfileRequest;
import com.eduquest.model.User;
import com.eduquest.service.UserService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

@RestController
@RequestMapping("/api/users")
@RequiredArgsConstructor
public class UserController {

    private final UserService userService;

    @GetMapping("/me")
    public ResponseEntity<ApiResponse<User>> getProfile(@AuthenticationPrincipal User user) {
        return ResponseEntity.ok(ApiResponse.ok(userService.getUser(user.getId())));
    }

    @PutMapping("/me")
    public ResponseEntity<ApiResponse<User>> updateProfile(
            @AuthenticationPrincipal User user,
            @RequestBody UpdateProfileRequest request) {
        return ResponseEntity.ok(ApiResponse.ok(userService.updateProfile(user.getId(), request)));
    }

    @PostMapping("/me/photo")
    public ResponseEntity<ApiResponse<User>> uploadPhoto(
            @AuthenticationPrincipal User user,
            @RequestParam("file") MultipartFile file) {
        return ResponseEntity.ok(ApiResponse.ok(userService.uploadProfilePhoto(user.getId(), file)));
    }
}
