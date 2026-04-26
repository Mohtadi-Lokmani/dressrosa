package com.dressrosa.dressrosa_backend.dto.user;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class StudioTodoResponse {
    private List<TodoItem> items;

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class TodoItem {
        private String id;
        private String title;
        private String description;
        private String type; // e.g., "ORDER", "PRODUCT", "SETUP"
        private String priority; // "HIGH", "MEDIUM", "LOW"
        private String actionUrl;
    }
}
