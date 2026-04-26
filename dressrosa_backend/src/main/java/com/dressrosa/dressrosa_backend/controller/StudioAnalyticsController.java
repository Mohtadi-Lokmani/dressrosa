package com.dressrosa.dressrosa_backend.controller;

import com.dressrosa.dressrosa_backend.dto.studio.StudioAnalyticsResponse;
import com.dressrosa.dressrosa_backend.dto.user.UserDTO;
import com.dressrosa.dressrosa_backend.service.AnalyticsService;
import com.dressrosa.dressrosa_backend.service.UserService;
import com.dressrosa.dressrosa_backend.util.SecurityUtil;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/studio/analytics")
@CrossOrigin(origins = "*")
@PreAuthorize("hasRole('SELLER')")
public class StudioAnalyticsController {

    @Autowired
    private AnalyticsService analyticsService;

    @Autowired
    private UserService userService;

    @GetMapping("/overview")
    public ResponseEntity<StudioAnalyticsResponse> getOverview(@RequestParam(defaultValue = "30") int days) {
        String email = SecurityUtil.getCurrentUserEmail();
        UserDTO currentUser = userService.getCurrentUser(email);
        
        StudioAnalyticsResponse overview = analyticsService.getOverview(currentUser.getUserId(), days);
        return ResponseEntity.ok(overview);
    }
}
