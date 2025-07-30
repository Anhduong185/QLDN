import React, { useState } from "react";
import { Layout } from "antd";
import AppHeader from "../common/Header";
import NhanSuPage from "../NhanSu/NhanSuPage";
import ChamCongPage from "../ChamCong/ChamCongPage";

const { Content } = Layout;

const MainLayout = () => {
  const [currentModule, setCurrentModule] = useState("nhan-su");

  // Xử lý khi chọn menu từ header
  const handleMenuSelect = (menuKey) => {
    // Map menu key từ header sang module
    const moduleMap = {
      "nhan-su": "nhan-su",
      "danh-sach-nhan-vien": "nhan-su",
      "phong-ban": "nhan-su",
      "chuc-vu": "nhan-su",
      "hop-dong": "nhan-su",
      "bang-cap": "nhan-su",
      "cham-cong": "cham-cong",
      "check-in": "cham-cong",
      "lich-su-cham-cong": "cham-cong",
      "nghi-phep": "cham-cong",
      "ca-lam-viec": "cham-cong",
      "dang-ky-khuon-mat": "cham-cong",
      export: "cham-cong",
    };

    const module = moduleMap[menuKey];
    if (module) {
      setCurrentModule(module);
    }
  };

  // Render component tương ứng với module
  const renderModule = () => {
    switch (currentModule) {
      case "nhan-su":
        return <NhanSuPage />;
      case "cham-cong":
        return <ChamCongPage />;
      default:
        return <NhanSuPage />;
    }
  };

  return (
    <Layout style={{ minHeight: "100vh" }}>
      <AppHeader onMenuSelect={handleMenuSelect} />
      <Content style={{ background: "#f5f5f5" }}>{renderModule()}</Content>
    </Layout>
  );
};

export default MainLayout;
