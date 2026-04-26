package com.dressrosa.dressrosa_backend.dto.studio;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class StudioHomeTodoResponse {
    private List<TodoItem> items;

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class TodoItem {
        private String id;
        private String type; // ORDER, MESSAGE, STOCK, REVIEW, BOOST
        private String title;
        private String description;
        private String actionText;
        private String actionLink;
        private Integer count;
        private String priority; // HIGH, MEDIUM, LOW
    }
}
