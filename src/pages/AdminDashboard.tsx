import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useSiteSettings } from '@/contexts/SiteSettingsContext';
import { Service, subscribeToServices, addService, updateService, deleteService } from '@/lib/services';
import { updateFirebaseConfig, setCloudinaryName, getCloudinaryName } from '@/lib/firebase';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { ImageUpload } from '@/components/ImageUpload';
import { ThemeSelector } from '@/components/ThemeSelector';
import { LanguageSelector } from '@/components/LanguageSelector';
import { useToast } from '@/hooks/use-toast';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@/components/ui/tabs';
import {
  Sparkles,
  Plus,
  Settings,
  CreditCard,
  Database,
  Cloud,
  Palette,
  Edit,
  Trash2,
  LogOut,
  Package,
  X,
} from 'lucide-react';

const AdminDashboard: React.FC = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { user, logout, role, isDemoAdmin } = useAuth();
  const { siteSettings, paymentSettings, updateSiteSettings, updatePaymentSettings } = useSiteSettings();
  const { toast } = useToast();

  const [services, setServices] = useState<Service[]>([]);
  const [showAddService, setShowAddService] = useState(false);
  const [editingService, setEditingService] = useState<Service | null>(null);
  const [activeTab, setActiveTab] = useState('services');

  // Form states
  const [serviceForm, setServiceForm] = useState({
    name: '',
    price: '',
    slug: '',
    logo: '',
    sampleImages: [] as string[],
  });

  const [siteForm, setSiteForm] = useState(siteSettings);
  const [paymentForm, setPaymentForm] = useState(paymentSettings);
  const [firebaseForm, setFirebaseForm] = useState({
    apiKey: '',
    authDomain: '',
    projectId: '',
    storageBucket: '',
    messagingSenderId: '',
    appId: '',
  });
  const [cloudinaryForm, setCloudinaryForm] = useState({
    cloudName: getCloudinaryName(),
  });

  useEffect(() => {
    if (!user) {
      navigate('/auth');
      return;
    }

    if (role !== 'admin' && role !== 'demo-admin') {
      toast({
        title: t('admin.accessDenied'),
        variant: 'destructive',
      });
      navigate('/dashboard');
      return;
    }

    const unsubscribe = subscribeToServices(setServices);
    return () => unsubscribe();
  }, [user, role, navigate, toast, t]);

  useEffect(() => {
    setSiteForm(siteSettings);
  }, [siteSettings]);

  useEffect(() => {
    setPaymentForm(paymentSettings);
  }, [paymentSettings]);

  const showDemoRestriction = () => {
    toast({
      title: t('admin.demoRestricted'),
      variant: 'destructive',
    });
  };

  const handleAddService = async () => {
    if (isDemoAdmin) {
      showDemoRestriction();
      return;
    }

    try {
      await addService(serviceForm);
      setShowAddService(false);
      setServiceForm({ name: '', price: '', slug: '', logo: '', sampleImages: [] });
      toast({ title: t('common.success') });
    } catch (error) {
      toast({ title: t('common.error'), variant: 'destructive' });
    }
  };

  const handleUpdateService = async () => {
    if (isDemoAdmin) {
      showDemoRestriction();
      return;
    }

    if (!editingService) return;

    try {
      await updateService(editingService.id, serviceForm);
      setEditingService(null);
      setServiceForm({ name: '', price: '', slug: '', logo: '', sampleImages: [] });
      toast({ title: t('common.success') });
    } catch (error) {
      toast({ title: t('common.error'), variant: 'destructive' });
    }
  };

  const handleDeleteService = async (id: string) => {
    if (isDemoAdmin) {
      showDemoRestriction();
      return;
    }

    try {
      await deleteService(id);
      toast({ title: t('common.success') });
    } catch (error) {
      toast({ title: t('common.error'), variant: 'destructive' });
    }
  };

  const handleSaveSiteSettings = async () => {
    if (isDemoAdmin) {
      showDemoRestriction();
      return;
    }

    try {
      await updateSiteSettings(siteForm);
      toast({ title: t('common.success') });
    } catch (error) {
      toast({ title: t('common.error'), variant: 'destructive' });
    }
  };

  const handleSavePaymentSettings = async () => {
    if (isDemoAdmin) {
      showDemoRestriction();
      return;
    }

    try {
      await updatePaymentSettings(paymentForm);
      toast({ title: t('common.success') });
    } catch (error) {
      toast({ title: t('common.error'), variant: 'destructive' });
    }
  };

  const handleSaveFirebaseSettings = () => {
    if (isDemoAdmin) {
      showDemoRestriction();
      return;
    }

    if (!firebaseForm.apiKey || !firebaseForm.projectId) {
      toast({ title: 'API Key and Project ID are required', variant: 'destructive' });
      return;
    }

    updateFirebaseConfig(firebaseForm);
  };

  const handleSaveCloudinarySettings = () => {
    if (isDemoAdmin) {
      showDemoRestriction();
      return;
    }

    setCloudinaryName(cloudinaryForm.cloudName);
    toast({ title: t('common.success') });
  };

  const handleLogout = async () => {
    await logout();
    navigate('/');
  };

  const openEditService = (service: Service) => {
    setEditingService(service);
    setServiceForm({
      name: service.name,
      price: service.price,
      slug: service.slug,
      logo: service.logo,
      sampleImages: service.sampleImages || [],
    });
  };

  if (!user) return null;

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 glass-card border-b border-border">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-lg gradient-bg flex items-center justify-center">
                <Sparkles className="w-5 h-5 text-primary-foreground" />
              </div>
              <div>
                <span className="font-display font-bold text-xl block">
                  {t('admin.dashboard')}
                </span>
                {isDemoAdmin && (
                  <span className="text-xs text-warning">Demo Mode</span>
                )}
              </div>
            </div>

            <div className="flex items-center gap-2">
              <LanguageSelector />
              <Button variant="outline" onClick={handleLogout} className="gap-2">
                <LogOut className="w-4 h-4" />
                <span className="hidden sm:inline">{t('auth.logout')}</span>
              </Button>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid grid-cols-3 md:grid-cols-6 gap-2 h-auto p-2 mb-8">
            <TabsTrigger value="services" className="gap-2 py-3">
              <Package className="w-4 h-4" />
              <span className="hidden sm:inline">{t('admin.addService')}</span>
            </TabsTrigger>
            <TabsTrigger value="site" className="gap-2 py-3">
              <Settings className="w-4 h-4" />
              <span className="hidden sm:inline">{t('admin.siteSettings')}</span>
            </TabsTrigger>
            <TabsTrigger value="payment" className="gap-2 py-3">
              <CreditCard className="w-4 h-4" />
              <span className="hidden sm:inline">{t('admin.paymentSettings')}</span>
            </TabsTrigger>
            <TabsTrigger value="firebase" className="gap-2 py-3">
              <Database className="w-4 h-4" />
              <span className="hidden sm:inline">{t('admin.firebaseSettings')}</span>
            </TabsTrigger>
            <TabsTrigger value="cloudinary" className="gap-2 py-3">
              <Cloud className="w-4 h-4" />
              <span className="hidden sm:inline">{t('admin.cloudinarySettings')}</span>
            </TabsTrigger>
            <TabsTrigger value="themes" className="gap-2 py-3">
              <Palette className="w-4 h-4" />
              <span className="hidden sm:inline">{t('admin.themes')}</span>
            </TabsTrigger>
          </TabsList>

          {/* Services Tab */}
          <TabsContent value="services">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-6"
            >
              <div className="flex justify-between items-center">
                <h2 className="text-2xl font-display font-bold">Services</h2>
                <Button onClick={() => setShowAddService(true)} className="gap-2">
                  <Plus className="w-4 h-4" />
                  {t('admin.addService')}
                </Button>
              </div>

              {services.length === 0 ? (
                <div className="text-center py-16 glass-card rounded-2xl">
                  <Package className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
                  <p className="text-muted-foreground">No services yet. Add your first service!</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {services.map((service) => (
                    <div key={service.id} className="glass-card rounded-xl p-4">
                      <div className="flex items-center gap-3 mb-4">
                        {service.logo ? (
                          <img
                            src={service.logo}
                            alt={service.name}
                            className="w-12 h-12 rounded-lg object-cover"
                          />
                        ) : (
                          <div className="w-12 h-12 rounded-lg gradient-bg flex items-center justify-center">
                            <span className="text-lg font-bold text-primary-foreground">
                              {service.name.charAt(0)}
                            </span>
                          </div>
                        )}
                        <div className="flex-1">
                          <h3 className="font-semibold">{service.name}</h3>
                          <p className="text-sm text-primary">{service.price}</p>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          className="flex-1 gap-1"
                          onClick={() => openEditService(service)}
                        >
                          <Edit className="w-3 h-3" />
                          {t('admin.edit')}
                        </Button>
                        <Button
                          variant="destructive"
                          size="sm"
                          className="flex-1 gap-1"
                          onClick={() => handleDeleteService(service.id)}
                        >
                          <Trash2 className="w-3 h-3" />
                          {t('admin.delete')}
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </motion.div>
          </TabsContent>

          {/* Site Settings Tab */}
          <TabsContent value="site">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="max-w-2xl space-y-6"
            >
              <h2 className="text-2xl font-display font-bold">{t('admin.siteSettings')}</h2>
              
              <div className="glass-card rounded-xl p-6 space-y-4">
                <div className="space-y-2">
                  <Label>{t('admin.websiteName')}</Label>
                  <Input
                    value={siteForm.websiteName}
                    onChange={(e) => setSiteForm({ ...siteForm, websiteName: e.target.value })}
                  />
                </div>

                <div className="space-y-2">
                  <Label>{t('admin.websiteDescription')}</Label>
                  <Textarea
                    value={siteForm.websiteDescription}
                    onChange={(e) => setSiteForm({ ...siteForm, websiteDescription: e.target.value })}
                    rows={3}
                  />
                </div>

                <div className="space-y-2">
                  <Label>{t('admin.footerText')}</Label>
                  <Input
                    value={siteForm.footerText}
                    onChange={(e) => setSiteForm({ ...siteForm, footerText: e.target.value })}
                  />
                </div>

                <div className="space-y-2">
                  <Label>{t('admin.websiteLogo')}</Label>
                  <ImageUpload
                    value={siteForm.websiteLogo}
                    onChange={(url) => setSiteForm({ ...siteForm, websiteLogo: url as string })}
                  />
                </div>

                <div className="space-y-2">
                  <Label>{t('admin.supportGmail')}</Label>
                  <Input
                    type="email"
                    value={siteForm.supportGmail}
                    onChange={(e) => setSiteForm({ ...siteForm, supportGmail: e.target.value })}
                  />
                </div>

                <div className="space-y-2">
                  <Label>{t('admin.whatsappNumber')}</Label>
                  <Input
                    value={siteForm.whatsappNumber}
                    onChange={(e) => setSiteForm({ ...siteForm, whatsappNumber: e.target.value })}
                    placeholder="+1234567890"
                  />
                </div>

                <Button onClick={handleSaveSiteSettings} className="w-full">
                  {t('admin.save')}
                </Button>
              </div>
            </motion.div>
          </TabsContent>

          {/* Payment Settings Tab */}
          <TabsContent value="payment">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="max-w-2xl space-y-6"
            >
              <h2 className="text-2xl font-display font-bold">{t('admin.paymentSettings')}</h2>
              
              <div className="glass-card rounded-xl p-6 space-y-4">
                <div className="space-y-2">
                  <Label>Payment Logo</Label>
                  <ImageUpload
                    value={paymentForm.paymentLogo}
                    onChange={(url) => setPaymentForm({ ...paymentForm, paymentLogo: url as string })}
                  />
                </div>

                <div className="space-y-2">
                  <Label>Account Name</Label>
                  <Input
                    value={paymentForm.accountName}
                    onChange={(e) => setPaymentForm({ ...paymentForm, accountName: e.target.value })}
                  />
                </div>

                <div className="space-y-2">
                  <Label>Account Number</Label>
                  <Input
                    value={paymentForm.accountNumber}
                    onChange={(e) => setPaymentForm({ ...paymentForm, accountNumber: e.target.value })}
                  />
                </div>

                <div className="space-y-2">
                  <Label>IBAN (Optional)</Label>
                  <Input
                    value={paymentForm.iban}
                    onChange={(e) => setPaymentForm({ ...paymentForm, iban: e.target.value })}
                  />
                </div>

                <Button onClick={handleSavePaymentSettings} className="w-full">
                  {t('admin.save')}
                </Button>
              </div>
            </motion.div>
          </TabsContent>

          {/* Firebase Settings Tab */}
          <TabsContent value="firebase">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="max-w-2xl space-y-6"
            >
              <h2 className="text-2xl font-display font-bold">{t('admin.firebaseSettings')}</h2>
              
              <div className="glass-card rounded-xl p-6 space-y-4">
                <p className="text-sm text-muted-foreground mb-4">
                  ⚠️ Changing Firebase config will reload the app and connect to a new database.
                </p>

                <div className="space-y-2">
                  <Label>API Key</Label>
                  <Input
                    value={firebaseForm.apiKey}
                    onChange={(e) => setFirebaseForm({ ...firebaseForm, apiKey: e.target.value })}
                    placeholder="AIza..."
                  />
                </div>

                <div className="space-y-2">
                  <Label>Auth Domain</Label>
                  <Input
                    value={firebaseForm.authDomain}
                    onChange={(e) => setFirebaseForm({ ...firebaseForm, authDomain: e.target.value })}
                    placeholder="your-app.firebaseapp.com"
                  />
                </div>

                <div className="space-y-2">
                  <Label>Project ID</Label>
                  <Input
                    value={firebaseForm.projectId}
                    onChange={(e) => setFirebaseForm({ ...firebaseForm, projectId: e.target.value })}
                    placeholder="your-project-id"
                  />
                </div>

                <div className="space-y-2">
                  <Label>Storage Bucket</Label>
                  <Input
                    value={firebaseForm.storageBucket}
                    onChange={(e) => setFirebaseForm({ ...firebaseForm, storageBucket: e.target.value })}
                    placeholder="your-app.appspot.com"
                  />
                </div>

                <div className="space-y-2">
                  <Label>Messaging Sender ID</Label>
                  <Input
                    value={firebaseForm.messagingSenderId}
                    onChange={(e) => setFirebaseForm({ ...firebaseForm, messagingSenderId: e.target.value })}
                  />
                </div>

                <div className="space-y-2">
                  <Label>App ID</Label>
                  <Input
                    value={firebaseForm.appId}
                    onChange={(e) => setFirebaseForm({ ...firebaseForm, appId: e.target.value })}
                  />
                </div>

                <Button onClick={handleSaveFirebaseSettings} className="w-full" variant="destructive">
                  Save & Reload App
                </Button>
              </div>
            </motion.div>
          </TabsContent>

          {/* Cloudinary Settings Tab */}
          <TabsContent value="cloudinary">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="max-w-2xl space-y-6"
            >
              <h2 className="text-2xl font-display font-bold">{t('admin.cloudinarySettings')}</h2>
              
              <div className="glass-card rounded-xl p-6 space-y-4">
                <div className="bg-amber-500/10 border border-amber-500/20 rounded-lg p-4 mb-4">
                  <p className="text-sm text-amber-600 dark:text-amber-400 font-medium mb-2">
                    ⚠️ Important: Cloud Name ≠ Upload Preset
                  </p>
                  <p className="text-sm text-muted-foreground">
                    Your <strong>Cloud Name</strong> is found in your Cloudinary Dashboard (looks like "dxxxxxxxx" or a custom name you set). It is NOT "ml_default" - that's the upload preset name.
                  </p>
                </div>

                <div className="bg-primary/5 border border-primary/20 rounded-lg p-4 mb-4">
                  <p className="text-sm font-medium mb-2">📋 Setup Requirements:</p>
                  <ol className="text-sm text-muted-foreground space-y-1 list-decimal list-inside">
                    <li>Go to <a href="https://cloudinary.com/console" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">Cloudinary Dashboard</a></li>
                    <li>Copy your <strong>Cloud Name</strong> from the top of the dashboard</li>
                    <li>Go to Settings → Upload → Add upload preset</li>
                    <li>Create an <strong>unsigned</strong> preset named "ml_default"</li>
                  </ol>
                </div>

                <div className="space-y-2">
                  <Label>Cloud Name</Label>
                  <Input
                    value={cloudinaryForm.cloudName}
                    onChange={(e) => setCloudinaryForm({ ...cloudinaryForm, cloudName: e.target.value })}
                    placeholder="e.g., dxxxxxxxx or your-custom-name"
                  />
                  {cloudinaryForm.cloudName === 'ml_default' && (
                    <p className="text-sm text-destructive">
                      ❌ "ml_default" is the upload preset, not the cloud name!
                    </p>
                  )}
                </div>

                <Button onClick={handleSaveCloudinarySettings} className="w-full">
                  {t('admin.save')}
                </Button>
              </div>
            </motion.div>
          </TabsContent>

          {/* Themes Tab */}
          <TabsContent value="themes">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-6"
            >
              <h2 className="text-2xl font-display font-bold">{t('admin.themes')}</h2>
              
              <div className="glass-card rounded-xl p-6">
                <ThemeSelector disabled={isDemoAdmin} onDisabledClick={showDemoRestriction} />
              </div>
            </motion.div>
          </TabsContent>
        </Tabs>
      </main>

      {/* Add/Edit Service Dialog */}
      <Dialog open={showAddService || !!editingService} onOpenChange={(open) => {
        if (!open) {
          setShowAddService(false);
          setEditingService(null);
          setServiceForm({ name: '', price: '', slug: '', logo: '', sampleImages: [] });
        }
      }}>
        <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {editingService ? 'Edit Service' : 'Add New Service'}
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4 pt-4">
            <div className="space-y-2">
              <Label>{t('admin.serviceName')}</Label>
              <Input
                value={serviceForm.name}
                onChange={(e) => setServiceForm({ ...serviceForm, name: e.target.value })}
                placeholder="Service name"
              />
            </div>

            <div className="space-y-2">
              <Label>{t('admin.servicePrice')}</Label>
              <Input
                value={serviceForm.price}
                onChange={(e) => setServiceForm({ ...serviceForm, price: e.target.value })}
                placeholder="$99"
              />
            </div>

            <div className="space-y-2">
              <Label>{t('admin.serviceSlug')}</Label>
              <Input
                value={serviceForm.slug}
                onChange={(e) => setServiceForm({ ...serviceForm, slug: e.target.value })}
                placeholder="service-name"
              />
            </div>

            <div className="space-y-2">
              <Label>{t('admin.serviceLogo')}</Label>
              <ImageUpload
                value={serviceForm.logo}
                onChange={(url) => setServiceForm({ ...serviceForm, logo: url as string })}
              />
            </div>

            <div className="space-y-2">
              <Label>{t('admin.sampleImages')}</Label>
              <ImageUpload
                value={serviceForm.sampleImages}
                onChange={(urls) => setServiceForm({ ...serviceForm, sampleImages: urls as string[] })}
                multiple
              />
            </div>

            <div className="flex gap-2 pt-4">
              <Button
                variant="outline"
                onClick={() => {
                  setShowAddService(false);
                  setEditingService(null);
                  setServiceForm({ name: '', price: '', slug: '', logo: '', sampleImages: [] });
                }}
                className="flex-1"
              >
                {t('admin.cancel')}
              </Button>
              <Button
                onClick={editingService ? handleUpdateService : handleAddService}
                className="flex-1"
              >
                {t('admin.save')}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdminDashboard;
