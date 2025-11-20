export default function Card({ title, value }: { title: string; value: string }) {
  return (
    <div className="bg-white rounded-xl shadow p-4 flex flex-col items-start">
      <div className="text-sm text-gray-500">{title}</div>
      <div className="text-2xl font-bold mt-2">{value}</div>
    </div>
  );
}