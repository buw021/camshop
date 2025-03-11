export const statusColor = (status: string) => {
  switch (status) {
    case "ordered":
      return "bg-lime-200 text-lime-800 border-lime-300 bg-";
    case "pending":
      return "bg-yellow-200 text-yellow-800 border-yellow-300";
    case "processed":
      return "bg-blue-200 text-blue-800 border-blue-300";
    case "shipped":
      return "bg-teal-200 text-teal-800 border-teal-300";
    case "delivered":
    case "refunded":
      return "bg-green-200 text-green-800 border-green-300";
    case "cancelled":
      return "bg-red-200 text-red-800  border-red-300";
    case "refund on process":
      return "bg-violet-200 text-violet-800  border-violet-300";
      case "refund requested":
      return "bg-pink-200 text-pink-800  border-pink-300 animate-pulse";
    default:
      return "bg-gray-200 text-gray-800 border-gray-300";
  }
};