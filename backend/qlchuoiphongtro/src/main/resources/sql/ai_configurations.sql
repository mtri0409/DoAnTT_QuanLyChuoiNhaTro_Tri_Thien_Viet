-- Tạo bảng ai_configurations
CREATE TABLE IF NOT EXISTS ai_configurations (
    config_id INT AUTO_INCREMENT PRIMARY KEY,
    config_key VARCHAR(100) NOT NULL UNIQUE,
    config_value TEXT NOT NULL,
    description VARCHAR(255),
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Chèn dữ liệu mẫu cho Gemini
INSERT INTO ai_configurations (config_key, config_value, description) VALUES
('AI_PROVIDER', 'GEMINI', 'Nhà cung cấp AI hiện tại: GEMINI hoặc MISTRAL'),
('AI_API_KEY', 'your_gemini_api_key_here', 'API Key cho Gemini'),
('AI_BASE_URL', 'https://generativelanguage.googleapis.com', 'Base URL cho API Gemini'),
('AI_MODEL', 'gemini-1.5-pro', 'Tên mô hình Gemini'),
('AI_SERVICE_INTERNAL_URL', 'http://ai-services:8000/api/v1/chat', 'Endpoint FastAPI cho AI Service'),
('JAVA_BACKEND_BASE_URL', 'http://backend:8080', 'Base URL của Java Backend cho callback')
ON DUPLICATE KEY UPDATE config_value = VALUES(config_value);

-- Chèn dữ liệu mẫu cho Mistral (commented out)
-- INSERT INTO ai_configurations (config_key, config_value, description) VALUES
-- ('AI_PROVIDER', 'MISTRAL', 'Nhà cung cấp AI hiện tại: GEMINI hoặc MISTRAL'),
-- ('AI_API_KEY', 'your_mistral_api_key_here', 'API Key cho Mistral'),
-- ('AI_BASE_URL', 'https://api.mistral.ai', 'Base URL cho API Mistral'),
-- ('AI_MODEL', 'mistral-large-latest', 'Tên mô hình Mistral'),
-- ('AI_SERVICE_INTERNAL_URL', 'http://localhost:8000/api/v1/chat', 'Endpoint FastAPI cho AI Service'),
-- ('JAVA_BACKEND_BASE_URL', 'http://localhost:8080', 'Base URL của Java Backend cho callback')
-- ON DUPLICATE KEY UPDATE config_value = VALUES(config_value);