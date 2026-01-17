import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useSiteSettings } from '@/contexts/SiteSettingsContext';
import { Service, subscribeToServices } from '@/lib/services';
import { Button } from '@/components/ui/button';
import { ServiceCard } from '@/components/ServiceCard';
import { LanguageSelector } from '@/components/LanguageSelector';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Sparkles, User, LogOut, Mail, HelpCircle, Package } from 'lucide-react';

const UserDashboard: React.FC = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { user, logout, role } = useAuth();
  const { siteSettings } = useSiteSettings();
  const [services, setServices] = useState<Service[]>([]);
  const [showProfile, setShowProfile] = useState(false);

  useEffect(() => {
    if (!user) {
      navigate('/auth');
      return;
    }

    // Redirect admins to admin dashboard
    if (role === 'admin' || role === 'demo-admin') {
      navigate('/admin');
      return;
    }

    const unsubscribe = subscribeToServices(setServices);
    return () => unsubscribe();
  }, [user, role, navigate]);

  const handleLogout = async () => {
    await logout();
    navigate('/');
  };

  const handleSupport = () => {
    const email = siteSettings.supportGmail;
    const whatsapp = siteSettings.whatsappNumber;
    
    if (email) {
      window.open(`mailto:${email}`, '_blank');
    }
    if (whatsapp) {
      window.open(`https://wa.me/${whatsapp.replace(/\D/g, '')}`, '_blank');
    }
  };

  if (!user) return null;

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 glass-card border-b border-border">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              {siteSettings.websiteLogo ? (
                <img
                  src={siteSettings.websiteLogo}
                  alt={siteSettings.websiteName}
                  className="h-10 w-10 rounded-lg object-cover"
                />
              ) : (
                <div className="h-10 w-10 rounded-lg gradient-bg flex items-center justify-center">
                  <Sparkles className="w-5 h-5 text-primary-foreground" />
                </div>
              )}
              <span className="font-display font-bold text-xl hidden sm:block">
                {siteSettings.websiteName}
              </span>
            </div>

            <div className="flex items-center gap-2">
              {/* Profile Button */}
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setShowProfile(true)}
              >
                <User className="w-5 h-5" />
              </Button>

              {/* Support */}
              <Button variant="ghost" size="icon" onClick={handleSupport}>
                <HelpCircle className="w-5 h-5" />
              </Button>

              {/* Language */}
              <LanguageSelector />

              {/* User Menu */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" className="gap-2">
                    <div className="w-6 h-6 rounded-full gradient-bg flex items-center justify-center text-xs text-primary-foreground font-semibold">
                      {user.displayName?.charAt(0) || user.email?.charAt(0) || 'U'}
                    </div>
                    <span className="hidden sm:inline max-w-[120px] truncate">
                      {user.displayName || user.email}
                    </span>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={() => setShowProfile(true)}>
                    <User className="w-4 h-4 mr-2" />
                    {t('dashboard.profile')}
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={handleLogout} className="text-destructive">
                    <LogOut className="w-4 h-4 mr-2" />
                    {t('auth.logout')}
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div className="mb-8">
            <h1 className="text-3xl font-display font-bold mb-2">
              {t('dashboard.welcome')}, {user.displayName || 'User'}! 👋
            </h1>
            <p className="text-muted-foreground">
              Browse our services and place your order
            </p>
          </div>

          {/* Services Section */}
          <section>
            <div className="flex items-center gap-2 mb-6">
              <Package className="w-5 h-5 text-primary" />
              <h2 className="text-xl font-display font-semibold">
                {t('dashboard.services')}
              </h2>
            </div>

            {services.length === 0 ? (
              <div className="text-center py-16 glass-card rounded-2xl">
                <Package className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
                <p className="text-muted-foreground">{t('dashboard.noServices')}</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {services.map((service, index) => (
                  <motion.div
                    key={service.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3, delay: index * 0.1 }}
                  >
                    <ServiceCard service={service} />
                  </motion.div>
                ))}
              </div>
            )}
          </section>
        </motion.div>
      </main>

      {/* Profile Dialog */}
      <Dialog open={showProfile} onOpenChange={setShowProfile}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t('dashboard.profile')}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 pt-4">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-full gradient-bg flex items-center justify-center text-2xl text-primary-foreground font-bold">
                {user.displayName?.charAt(0) || user.email?.charAt(0) || 'U'}
              </div>
              <div>
                <h3 className="font-semibold text-lg">{user.displayName || 'User'}</h3>
                <p className="text-muted-foreground">{user.email}</p>
              </div>
            </div>
            <div className="space-y-3 pt-4 border-t border-border">
              <div className="flex justify-between">
                <span className="text-muted-foreground">{t('auth.fullName')}</span>
                <span className="font-medium">{user.displayName || '-'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">{t('auth.email')}</span>
                <span className="font-medium">{user.email}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">{t('auth.password')}</span>
                <span className="font-medium">••••••••</span>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Footer */}
      <footer className="border-t border-border py-6 mt-12">
        <div className="container mx-auto px-4 text-center text-muted-foreground text-sm">
          {siteSettings.footerText}
        </div>
      </footer>
    </div>
  );
};

export default UserDashboard;
