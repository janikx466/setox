import React from 'react';
import { motion } from 'framer-motion';
import { Service } from '@/lib/services';
import { useNavigate } from 'react-router-dom';

interface ServiceCardProps {
  service: Service;
}

export const ServiceCard: React.FC<ServiceCardProps> = ({ service }) => {
  const navigate = useNavigate();

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -5 }}
      transition={{ duration: 0.3 }}
      onClick={() => navigate(`/order/${service.slug}`)}
      className="glass-card rounded-2xl p-6 cursor-pointer hover-lift group"
    >
      <div className="flex items-center gap-4">
        {service.logo ? (
          <img
            src={service.logo}
            alt={service.name}
            className="w-16 h-16 rounded-xl object-cover border border-border"
          />
        ) : (
          <div className="w-16 h-16 rounded-xl gradient-bg flex items-center justify-center">
            <span className="text-2xl font-bold text-white">
              {service.name.charAt(0)}
            </span>
          </div>
        )}
        <div className="flex-1">
          <h3 className="font-display font-semibold text-lg text-foreground group-hover:text-primary transition-colors">
            {service.name}
          </h3>
          <p className="text-primary font-medium">{service.price}</p>
        </div>
        <div className="opacity-0 group-hover:opacity-100 transition-opacity">
          <svg
            className="w-6 h-6 text-primary"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9 5l7 7-7 7"
            />
          </svg>
        </div>
      </div>
    </motion.div>
  );
};
