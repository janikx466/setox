import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { useNavigate, useParams } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useSiteSettings } from '@/contexts/SiteSettingsContext';
import { Service, subscribeToServices } from '@/lib/services';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { ArrowLeft, MessageCircle, User, Mail, Phone, FileText, Tag, CreditCard } from 'lucide-react';
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from '@/components/ui/carousel';

const OrderPage: React.FC = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { slug } = useParams();
  const { user } = useAuth();
  const { siteSettings, paymentSettings } = useSiteSettings();
  const [service, setService] = useState<Service | null>(null);
  const [loading, setLoading] = useState(true);

  const [formData, setFormData] = useState({
    name: user?.displayName || '',
    email: user?.email || '',
    whatsapp: '',
    description: '',
    promoCode: '',
    senderName: user?.displayName || '',
    senderNumber: '',
    transactionId: '',
  });

  useEffect(() => {
    if (!user) {
      navigate('/auth');
      return;
    }

    const unsubscribe = subscribeToServices((services) => {
      const found = services.find((s) => s.slug === slug);
      setService(found || null);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [user, slug, navigate]);

  const handleOrderViaWhatsApp = () => {
    const whatsappNumber = siteSettings.whatsappNumber.replace(/\D/g, '');
    
    const message = `
🛒 *New Order Request*

📦 *Service:* ${service?.name}
💰 *Price:* ${service?.price}

👤 *Customer Information:*
• Name: ${formData.name}
• Email: ${formData.email}
• WhatsApp: ${formData.whatsapp}

📝 *Order Details:*
${formData.description}

${formData.promoCode ? `🏷️ *Promo Code:* ${formData.promoCode}` : ''}

💳 *Payment Information:*
• Sender Name: ${formData.senderName}
• Sender Number: ${formData.senderNumber}
• Transaction ID: ${formData.transactionId}
    `.trim();

    const encodedMessage = encodeURIComponent(message);
    window.open(`https://wa.me/${whatsappNumber}?text=${encodedMessage}`, '_blank');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary" />
      </div>
    );
  }

  if (!service) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center">
        <p className="text-muted-foreground mb-4">Service not found</p>
        <Button onClick={() => navigate('/dashboard')}>Go back</Button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          {/* Back button */}
          <button
            onClick={() => navigate('/dashboard')}
            className="flex items-center gap-2 text-muted-foreground hover:text-foreground mb-8 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to services
          </button>

          {/* Sample Images Carousel */}
          {service.sampleImages && service.sampleImages.length > 0 && (
            <div className="mb-8">
              <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <FileText className="w-5 h-5 text-primary" />
                {t('order.sampleImages')}
              </h2>
              <Carousel className="w-full max-w-3xl mx-auto">
                <CarouselContent>
                  {service.sampleImages.map((image, index) => (
                    <CarouselItem key={index}>
                      <div className="p-1">
                        <img
                          src={image}
                          alt={`Sample ${index + 1}`}
                          className="w-full h-64 object-cover rounded-xl"
                        />
                      </div>
                    </CarouselItem>
                  ))}
                </CarouselContent>
                <CarouselPrevious />
                <CarouselNext />
              </Carousel>
            </div>
          )}

          {/* Service Header */}
          <div className="glass-card rounded-2xl p-6 mb-8">
            <div className="flex items-center gap-4">
              {service.logo ? (
                <img
                  src={service.logo}
                  alt={service.name}
                  className="w-20 h-20 rounded-xl object-cover border border-border"
                />
              ) : (
                <div className="w-20 h-20 rounded-xl gradient-bg flex items-center justify-center">
                  <span className="text-3xl font-bold text-primary-foreground">
                    {service.name.charAt(0)}
                  </span>
                </div>
              )}
              <div>
                <h1 className="text-2xl font-display font-bold">{service.name}</h1>
                <p className="text-primary font-semibold text-xl">{service.price}</p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Order Form */}
            <div className="space-y-6">
              <h2 className="text-xl font-display font-semibold">
                {t('order.title')} Information
              </h2>

              {/* User Info */}
              <div className="glass-card rounded-xl p-6 space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="name" className="flex items-center gap-2">
                    <User className="w-4 h-4" />
                    {t('order.name')}
                  </Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="Your full name"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email" className="flex items-center gap-2">
                    <Mail className="w-4 h-4" />
                    {t('order.gmail')}
                  </Label>
                  <Input
                    id="email"
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    placeholder="your@gmail.com"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="whatsapp" className="flex items-center gap-2">
                    <Phone className="w-4 h-4" />
                    {t('order.whatsapp')}
                  </Label>
                  <Input
                    id="whatsapp"
                    value={formData.whatsapp}
                    onChange={(e) => setFormData({ ...formData, whatsapp: e.target.value })}
                    placeholder="+1234567890"
                  />
                </div>
              </div>

              {/* Order Details */}
              <div className="glass-card rounded-xl p-6 space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="description" className="flex items-center gap-2">
                    <FileText className="w-4 h-4" />
                    {t('order.description')}
                  </Label>
                  <Textarea
                    id="description"
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    placeholder="Describe your order requirements..."
                    rows={4}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="promoCode" className="flex items-center gap-2">
                    <Tag className="w-4 h-4" />
                    {t('order.promoCode')}
                  </Label>
                  <Input
                    id="promoCode"
                    value={formData.promoCode}
                    onChange={(e) => setFormData({ ...formData, promoCode: e.target.value })}
                    placeholder="Enter promo code"
                  />
                </div>
              </div>
            </div>

            {/* Payment Section */}
            <div className="space-y-6">
              <h2 className="text-xl font-display font-semibold flex items-center gap-2">
                <CreditCard className="w-5 h-5" />
                {t('order.payment')}
              </h2>

              {/* Payment Info Display */}
              <div className="glass-card rounded-xl p-6 space-y-4">
                {paymentSettings.paymentLogo && (
                  <div className="flex justify-center mb-4">
                    <img
                      src={paymentSettings.paymentLogo}
                      alt="Payment method"
                      className="h-16 object-contain"
                    />
                  </div>
                )}

                <div className="space-y-3 text-sm">
                  <div className="flex justify-between py-2 border-b border-border">
                    <span className="text-muted-foreground">{t('order.receiverName')}</span>
                    <span className="font-medium">{paymentSettings.accountName || '-'}</span>
                  </div>
                  <div className="flex justify-between py-2 border-b border-border">
                    <span className="text-muted-foreground">{t('order.receiverNumber')}</span>
                    <span className="font-medium">{paymentSettings.accountNumber || '-'}</span>
                  </div>
                  {paymentSettings.iban && (
                    <div className="flex justify-between py-2 border-b border-border">
                      <span className="text-muted-foreground">IBAN</span>
                      <span className="font-medium">{paymentSettings.iban}</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Sender Payment Details */}
              <div className="glass-card rounded-xl p-6 space-y-4">
                <h3 className="font-semibold">Your Payment Details</h3>

                <div className="space-y-2">
                  <Label htmlFor="senderName">{t('order.senderName')}</Label>
                  <Input
                    id="senderName"
                    value={formData.senderName}
                    onChange={(e) => setFormData({ ...formData, senderName: e.target.value })}
                    placeholder="Your name"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="senderNumber">{t('order.senderNumber')}</Label>
                  <Input
                    id="senderNumber"
                    value={formData.senderNumber}
                    onChange={(e) => setFormData({ ...formData, senderNumber: e.target.value })}
                    placeholder="Your phone number"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="transactionId">{t('order.transactionId')}</Label>
                  <Input
                    id="transactionId"
                    value={formData.transactionId}
                    onChange={(e) => setFormData({ ...formData, transactionId: e.target.value })}
                    placeholder="Transaction ID (TID)"
                  />
                </div>
              </div>

              {/* Order Button */}
              <Button
                variant="hero"
                size="xl"
                className="w-full gap-2"
                onClick={handleOrderViaWhatsApp}
              >
                <MessageCircle className="w-5 h-5" />
                {t('order.orderViaWhatsApp')}
              </Button>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default OrderPage;
