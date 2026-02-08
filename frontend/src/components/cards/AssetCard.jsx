import StatCard from "./StatCard";
import { ASSET_META } from "../../constants/assets";

export default function AssetCard({ assetId, price }) {
  const meta = ASSET_META[assetId];

  return (
    <StatCard
      id={assetId}
      title={
        <div className="asset-title">
          {meta?.icon && (
            <img
              src={meta.icon}
              alt={meta.label}
              className="asset-icon"
            />
          )}
          <span>{meta?.label || assetId}</span>
        </div>
      }
      value={price ? `$${price}` : "—"}
      subtitle="Live market price"
    />
  );
}
