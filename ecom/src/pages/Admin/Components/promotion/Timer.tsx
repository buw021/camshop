import React from "react";

export const TimerCell: React.FC<{ saleExpiryDate: Date }> = ({
  saleExpiryDate,
}) => {
  const now = new Date();
  now.setHours(0, 0, 0, 0);
  const expiryDate = new Date(saleExpiryDate);
  expiryDate.setHours(0, 0, 0, 0);

  const difference = expiryDate.getTime() - now.getTime();
  if (difference <= 0) {
    return <span className="text-red-600">Expired</span>;
  }
  // Check if the expiration date is today
  const isToday = now.toDateString() === expiryDate.toDateString();

  if (isToday) {
    return <span className="text-yellow-600">Last Day</span>;
  }

  const daysLeft = Math.ceil(difference / (1000 * 60 * 60 * 24));

  return <span className="text-green-600">{`${daysLeft} day/s`}</span>;
};
