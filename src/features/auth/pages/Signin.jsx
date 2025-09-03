import React, { Component } from "react";
import { Link, Navigate } from "react-router-dom";
import {
  Layout,
  Button,
  Row,
  Col,
  Typography,
  Form,
  Input,
  
} from "antd";
import { GoogleOutlined } from "@ant-design/icons";

const { Title } = Typography;
const { Content } = Layout;

export default class SignIn extends Component {
  render() {
    const onFinish = (values) => {
      console.log("Success:", values);
    };

    const onFinishFailed = (errorInfo) => {
      console.log("Failed:", errorInfo);
    };
    return (
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          minHeight: "100vh",
        }}
      >
        <Content className="signin">
          <Row gutter={[24, 0]} justify="space-around">
            <Col
              xs={{ span: 24, offset: 0 }}
              lg={{ span: 6, offset: 2 }}
              md={{ span: 12 }}
            >
              <Title className="mb-15" style={{ textAlign: "center" }}>
                Sign In
              </Title>
              <Title
                className="font-regular text-muted"
                level={5}
                style={{ textAlign: "center" }}
              >
                Enter your email and password to sign in
              </Title>
              <Form
                onFinish={onFinish}
                onFinishFailed={onFinishFailed}
                layout="vertical"
                className="row-col"
                style={{ gap: "8px" }}
              >
                <Form.Item
                  className="username"
                  label="Email"
                  name="email"
                  style={{ marginBottom: "12px" }}
                  rules={[
                    {
                      required: true,
                      message: "Please input your email!",
                    },
                  ]}
                >
                  <Input placeholder="Email" />
                </Form.Item>

                <Form.Item
                  className="username"
                  label="Password"
                  name="password"
                  style={{ marginBottom: "12px" }}
                  rules={[
                    {
                      required: true,
                      message: "Please input your password!",
                    },
                  ]}
                >
                  <Input placeholder="Password" />
                </Form.Item>
                <p
                  style={{ textAlign: "end", marginTop: "10px", marginBottom: "10px" }}
                  className="font-semibold text-muted"
                >
                  <Link to="/forgot" className="text-dark font-bold">
                       Forgot password?{" "}
                  </Link>
                </p>

                <Form.Item style={{ marginBottom: "8px" }}>
                  <Button
                    type="primary"
                    htmlType="submit"
                    style={{ width: "100%" }}
                  >
                    SIGN IN
                  </Button>
                </Form.Item>
                <div style={{ textAlign: "center" }}>or</div>
                <div className="social-signin">
                  <Button
                    type="default"
                    icon={<GoogleOutlined />}
                    style={{ width: "100%" }}
                    onClick={() => {
                      console.log("Google sign in");
                    }}
                  >
                    Sign in with Google
                  </Button>
                </div>

                <p
                  style={{ textAlign: "center", marginTop: "10px" }}
                  className="font-semibold text-muted"
                >
                  Don't have an account?{" "}
                  <Link to="/signup" className="text-dark font-bold">
                    Sign Up
                  </Link>
                </p>
              </Form>
            </Col>
          </Row>
        </Content>
      </div>
    );
  }
}
