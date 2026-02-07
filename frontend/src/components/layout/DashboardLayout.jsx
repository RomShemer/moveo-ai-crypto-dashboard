import Sidebar from "./Sidebar";
import Topbar from "./Topbar";
import "../../styles/dashboard.css";

export default function DashboardLayout({ children, investorType }) {
  return (
    <div className="dashboard-root">
      <Sidebar />
      <div className="dashboard-main">
        <Topbar investorType={investorType} />
        <main className="dashboard-content">{children}</main>
      </div>
    </div>
  );
}
