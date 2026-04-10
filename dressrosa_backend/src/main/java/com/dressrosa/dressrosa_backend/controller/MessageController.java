package com.dressrosa.dressrosa_backend.controller;

import com.dressrosa.dressrosa_backend.dto.common.ApiResponse;
import com.dressrosa.dressrosa_backend.dto.social.ConversationResponse;
import com.dressrosa.dressrosa_backend.dto.social.MessageRequest;
import com.dressrosa.dressrosa_backend.dto.social.MessageResponse;
import com.dressrosa.dressrosa_backend.dto.user.UserDTO;
import com.dressrosa.dressrosa_backend.service.MessageService;
import com.dressrosa.dressrosa_backend.service.UserService;
import com.dressrosa.dressrosa_backend.util.SecurityUtil;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;


@RestController
@RequestMapping("/api/messages")
@CrossOrigin(origins = "*")
public class MessageController {
    
    @Autowired
    private MessageService messageService;
    
    @Autowired
    private UserService userService;
    
   
    @PostMapping
    public ResponseEntity<MessageResponse> sendMessage(@Valid @RequestBody MessageRequest request) {
        String email = SecurityUtil.getCurrentUserEmail();
        UserDTO currentUser = userService.getCurrentUser(email);
        
        MessageResponse message = messageService.sendMessage(request, currentUser.getUserId());
        return ResponseEntity.status(HttpStatus.CREATED).body(message);
    }
    
    @GetMapping("/conversation/{userId}")
    public ResponseEntity<Page<MessageResponse>> getConversation(
            @PathVariable Long userId,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "50") int size) {
        
        String email = SecurityUtil.getCurrentUserEmail();
        UserDTO currentUser = userService.getCurrentUser(email);
        
        Pageable pageable = PageRequest.of(page, size, Sort.by(Sort.Direction.DESC, "sentAt"));
        Page<MessageResponse> messages = messageService.getConversation(
            userId, currentUser.getUserId(), pageable
        );
        
        return ResponseEntity.ok(messages);
    }
    
    @GetMapping("/conversations")
    public ResponseEntity<List<ConversationResponse>> getConversations() {
        String email = SecurityUtil.getCurrentUserEmail();
        UserDTO currentUser = userService.getCurrentUser(email);
        
        List<ConversationResponse> conversations = messageService.getConversations(
            currentUser.getUserId()
        );
        return ResponseEntity.ok(conversations);
    }
    
    @PutMapping("/{messageId}/read")
    public ResponseEntity<ApiResponse> markAsRead(@PathVariable Long messageId) {
        String email = SecurityUtil.getCurrentUserEmail();
        UserDTO currentUser = userService.getCurrentUser(email);
        
        messageService.markAsRead(messageId, currentUser.getUserId());
        return ResponseEntity.ok(ApiResponse.success("Message marked as read"));
    }
    
    @PutMapping("/conversation/{userId}/read")
    public ResponseEntity<ApiResponse> markConversationAsRead(@PathVariable Long userId) {
        String email = SecurityUtil.getCurrentUserEmail();
        UserDTO currentUser = userService.getCurrentUser(email);
        
        messageService.markConversationAsRead(userId, currentUser.getUserId());
        return ResponseEntity.ok(ApiResponse.success("Conversation marked as read"));
    }
    
    @GetMapping("/unread/count")
    public ResponseEntity<Long> getUnreadCount() {
        String email = SecurityUtil.getCurrentUserEmail();
        UserDTO currentUser = userService.getCurrentUser(email);
        
        long count = messageService.getUnreadCount(currentUser.getUserId());
        return ResponseEntity.ok(count);
    }
    
    @GetMapping("/unread")
    public ResponseEntity<List<MessageResponse>> getUnreadMessages() {
        String email = SecurityUtil.getCurrentUserEmail();
        UserDTO currentUser = userService.getCurrentUser(email);
        
        List<MessageResponse> messages = messageService.getUnreadMessages(currentUser.getUserId());
        return ResponseEntity.ok(messages);
    }
    
    @DeleteMapping("/{messageId}")
    public ResponseEntity<ApiResponse> deleteMessage(@PathVariable Long messageId) {
        String email = SecurityUtil.getCurrentUserEmail();
        UserDTO currentUser = userService.getCurrentUser(email);
        
        messageService.deleteMessage(messageId, currentUser.getUserId());
        return ResponseEntity.ok(ApiResponse.success("Message deleted"));
    }
}