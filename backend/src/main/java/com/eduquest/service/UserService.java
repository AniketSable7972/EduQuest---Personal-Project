package com.eduquest.service;

import com.eduquest.dto.UpdateProfileRequest;
import com.eduquest.exception.BadRequestException;
import com.eduquest.exception.ResourceNotFoundException;
import com.eduquest.model.User;
import com.eduquest.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class UserService {

    private final UserRepository userRepository;

    @Value("${app.upload.dir}")
    private String uploadDir;

    public User getUser(String userId) {
        return userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));
    }

    public User updateProfile(String userId, UpdateProfileRequest request) {
        User user = getUser(userId);
        if (request.getName() != null && !request.getName().isBlank()) {
            user.setName(request.getName());
        }
        return userRepository.save(user);
    }

    public User uploadProfilePhoto(String userId, MultipartFile file) {
        if (file == null || file.isEmpty()) {
            throw new BadRequestException("File is required");
        }

        User user = getUser(userId);

        try {
            Path uploadPath = Paths.get(uploadDir).toAbsolutePath().normalize();
            Files.createDirectories(uploadPath);

            String extension = getExtension(file.getOriginalFilename());
            String filename = userId + "_" + UUID.randomUUID() + extension;
            Path target = uploadPath.resolve(filename);

            Files.copy(file.getInputStream(), target, StandardCopyOption.REPLACE_EXISTING);
            user.setProfilePhotoUrl("/uploads/" + filename);
            return userRepository.save(user);
        } catch (IOException e) {
            throw new BadRequestException("Failed to upload profile photo");
        }
    }

    private String getExtension(String filename) {
        if (filename == null || !filename.contains(".")) {
            return ".jpg";
        }
        return filename.substring(filename.lastIndexOf('.'));
    }
}
