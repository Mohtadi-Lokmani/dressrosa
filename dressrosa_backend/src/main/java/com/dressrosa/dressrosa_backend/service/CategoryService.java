package com.dressrosa.dressrosa_backend.service;

import com.dressrosa.dressrosa_backend.model.Category;
import com.dressrosa.dressrosa_backend.repository.CategoryRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;

@Service
@RequiredArgsConstructor
@Transactional
public class CategoryService {
    
    private final CategoryRepository categoryRepository;
    
    // Get all categories
    public List<Category> getAllCategories() {
        return categoryRepository.findAll();
    }
    
    // Get category by ID
    public Optional<Category> getCategoryById(Long categoryId) {
        return categoryRepository.findById(categoryId);
    }
    
    // Get category by name
    public Optional<Category> getCategoryByName(String name) {
        return categoryRepository.findByName(name);
    }
    
    // Create new category (admin only - add later)
    public Category createCategory(String name) {
        // Check if category already exists
        if (categoryRepository.existsByName(name)) {
            throw new RuntimeException("Category with name '" + name + "' already exists");
        }
        
        Category category = new Category();
        category.setName(name);
        return categoryRepository.save(category);
    }
    
    // Update category (admin only - add later)
    public Category updateCategory(Long categoryId, String newName) {
        Category category = categoryRepository.findById(categoryId)
                .orElseThrow(() -> new RuntimeException("Category not found with id: " + categoryId));
        
        // Check if new name already exists (for a different category)
        if (!category.getName().equals(newName) && categoryRepository.existsByName(newName)) {
            throw new RuntimeException("Category with name '" + newName + "' already exists");
        }
        
        category.setName(newName);
        return categoryRepository.save(category);
    }
    
    // Delete category (admin only - add later)
    public void deleteCategory(Long categoryId) {
        if (!categoryRepository.existsById(categoryId)) {
            throw new RuntimeException("Category not found with id: " + categoryId);
        }
        categoryRepository.deleteById(categoryId);
    }
    
    // Check if category exists
    public boolean categoryExists(Long categoryId) {
        return categoryRepository.existsById(categoryId);
    }
}