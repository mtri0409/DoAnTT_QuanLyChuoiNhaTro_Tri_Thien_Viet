import React, { useState, useEffect } from "react";
import { Card, Button, Input, Form, message, Spin } from "antd";
import { SaveOutlined, EditOutlined, CloseOutlined } from "@ant-design/icons";
import apiAIConfig from "../../api/apiAIConfig";
import { useAuth } from "../../context/AuthContext";

const AIConfig = () => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const { user } = useAuth();
  const isAdmin = user?.role === "ADMIN";

  const fetchConfig = async () => {
    setLoading(true);
    try {
      const res = await apiAIConfig.getAiConfig();
      console.log("Raw response:", res);
      const data = res.data || res;
      console.log("Config data:", data);
      if (data) {
        form.setFieldsValue({
          apiKey: data.apiKey || "",
          baseUrl: data.baseUrl || "",
          model: data.model || "",
          description: data.description || ""
        });
      }
    } catch (err) {
      message.error(`Lỗi khi tải cấu hình AI: ${err.response?.data?.message || err.message}`);
      console.error("Lỗi chi tiết:", err.response || err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchConfig();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleSubmit = async (values) => {
    if (!isAdmin) {
      message.error("Bạn không có quyền cập nhật cấu hình AI");
      return;
    }
    setSaving(true);
    try {
      await apiAIConfig.updateAiConfig(values);
      message.success("Cập nhật cấu hình AI thành công");
      setIsEditing(false);
      fetchConfig();
    } catch (err) {
      message.error(`Lỗi khi cập nhật: ${err.response?.data?.message || err.message}`);
      console.error("Lỗi chi tiết:", err.response || err);
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    setIsEditing(false);
    fetchConfig(); // Reset lại dữ liệu
  };

  const handleEdit = () => {
    setIsEditing(true);
  };

  return (
    <div className="p-4">
      <Spin spinning={loading} tip="Đang tải cấu hình AI...">
        <Card
          title="Cấu hình AI"
          className="shadow-sm rounded-3"
          extra={
            isAdmin && (
              isEditing ? (
                <div className="d-flex gap-2">
                  <Button
                    type="primary"
                    icon={<SaveOutlined />}
                    onClick={() => form.submit()}
                    loading={saving}
                  >
                    Lưu
                  </Button>
                  <Button
                    icon={<CloseOutlined />}
                    onClick={handleCancel}
                    disabled={saving}
                  >
                    Hủy
                  </Button>
                </div>
              ) : (
                <Button
                  type="primary"
                  icon={<EditOutlined />}
                  onClick={handleEdit}
                >
                  Chỉnh sửa
                </Button>
              )
            )
          }
        >
          <Form
            form={form}
            layout="vertical"
            onFinish={handleSubmit}
            disabled={!isEditing || saving}
          >
            <Form.Item
              name="apiKey"
              label="API Key"
              rules={[{ required: true, message: "Vui lòng nhập API Key" }]}
            >
              <Input.Password placeholder="Nhập API Key" />
            </Form.Item>

            <Form.Item
              name="baseUrl"
              label="Base URL"
              rules={[{ required: true, message: "Vui lòng nhập Base URL" }]}
            >
              <Input placeholder="VD: https://api.mistral.ai/v1" />
            </Form.Item>

            <Form.Item
              name="model"
              label="Model"
              rules={[{ required: true, message: "Vui lòng nhập tên model" }]}
            >
              <Input placeholder="VD: mistral-small-latest" />
            </Form.Item>

            <Form.Item name="description" label="Mô tả">
              <Input.TextArea rows={3} placeholder="Mô tả cấu hình AI" />
            </Form.Item>
          </Form>
        </Card>
      </Spin>
    </div>
  );
};

export default AIConfig;