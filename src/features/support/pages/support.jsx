import React from "react";
import PageMeta from "../../../core/components/common/pageMeta";
import { SUPPORT_EMAIL } from "../config";

const SupportPage = () => {
  const mailTo = `mailto:${SUPPORT_EMAIL}`;

  return (
    <>
      <PageMeta
        title="StayMate | Hỗ trợ"
        description="Liên hệ đội ngũ StayMate để được hỗ trợ nhanh chóng"
      />
      <div className="min-h-screen bg-gradient-to-br from-indigo-100 via-white to-purple-100 flex items-center justify-center px-4">
        <div className="w-full max-w-2xl bg-white/90 backdrop-blur-sm shadow-2xl rounded-3xl p-10 border border-white/50 text-center space-y-6">
          <p className="text-indigo-600 font-semibold tracking-wide uppercase">
            Trung tâm hỗ trợ StayMate
          </p>
          <h1 className="text-4xl font-bold text-gray-900">
            Cần trợ giúp? Hãy gửi email cho chúng tôi
          </h1>
          <p className="text-lg text-gray-600">
            Đội ngũ StayMate luôn sẵn sàng hỗ trợ bạn 24/7. Vui lòng gửi yêu cầu,
            câu hỏi hoặc phản hồi qua địa chỉ email bên dưới, chúng tôi sẽ phản hồi
            sớm nhất có thể.
          </p>

          <div className="bg-gradient-to-r from-indigo-50 to-purple-50 border border-indigo-100 rounded-2xl p-6 space-y-4">
            <p className="text-sm uppercase text-gray-500 tracking-wide">
              Email hỗ trợ
            </p>
            <a
              href={mailTo}
              className="text-2xl font-semibold text-indigo-700 hover:text-indigo-900 transition-colors"
            >
              {SUPPORT_EMAIL}
            </a>
            <p className="text-sm text-gray-500">
              Nhấn vào địa chỉ email để mở ứng dụng gửi thư của bạn.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a
              href={mailTo}
              className="flex-1 sm:flex-none inline-flex items-center justify-center px-6 py-3 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-semibold shadow-lg hover:from-indigo-700 hover:to-purple-700 transition"
            >
              Gửi email ngay
            </a>
            <button
              type="button"
              onClick={() => navigator.clipboard?.writeText(SUPPORT_EMAIL)}
              className="flex-1 sm:flex-none inline-flex items-center justify-center px-6 py-3 rounded-xl border border-gray-200 text-gray-700 font-semibold hover:bg-gray-50 transition"
            >
              Sao chép email
            </button>
          </div>

          <p className="text-sm text-gray-500">
            Vui lòng cung cấp thông tin chi tiết về vấn đề bạn gặp phải để chúng tôi
            hỗ trợ chính xác hơn.
          </p>
        </div>
      </div>
    </>
  );
};

export default SupportPage;

