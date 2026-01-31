interface Props {
  title: string;
  value: string;
  change: string;
  type: "success" | "warning" | "danger";
}

import "./StatCard.css";

const StatCard = ({ title, value, change, type }: Props) => {
  return (
    <div className="stat-card">
      <div className="stat-title">{title}</div>

      <div className="stat-row">
        <div className={`stat-value ${type}`}>{value}</div>
        <div className={`stat-change ${type}`}>{change}</div>
      </div>
    </div>
  );
};

export default StatCard;