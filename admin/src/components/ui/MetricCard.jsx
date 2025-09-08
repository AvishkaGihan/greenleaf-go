const MetricCard = ({ icon, title, value }) => {
  return (
    <div className="bg-white rounded-lg shadow p-6 text-center">
      <div className="text-green-600 text-2xl mb-3">
        <i className={icon}></i>
      </div>
      <h3 className="text-gray-600 text-sm mb-2">{title}</h3>
      <div className="text-3xl font-bold text-green-600">{value}</div>
    </div>
  );
};

export default MetricCard;
