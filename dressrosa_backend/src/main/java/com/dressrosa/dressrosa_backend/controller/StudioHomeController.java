package com.dressrosa.dressrosa_backend.controller;

import com.dressrosa.dressrosa_backend.dto.studio.StudioHomeTodoResponse;
import com.dressrosa.dressrosa_backend.dto.user.UserDTO;
import com.dressrosa.dressrosa_backend.service.StudioHomeService;
import com.dressrosa.dressrosa_backend.service.UserService;
import com.dressrosa.dressrosa_backend.util.SecurityUtil;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/studio/home")
@CrossOrigin(origins = "*")
@PreAuthorize("hasRole('SELLER')")
public class StudioHomeController {

    @Autowired
    private StudioHomeService studioHomeService;

    @Autowired
    private UserService userService;

    @GetMapping("/todo")
    public ResponseEntity<StudioHomeTodoResponse> getTodo() {
        String email = SecurityUtil.getCurrentUserEmail();
        UserDTO currentUser = userService.getCurrentUser(email);
        
        StudioHomeTodoResponse todo = studioHomeService.getTodoItems(currentUser.getUserId());
        return ResponseEntity.ok(todo);
    }
}
