"use client";

import { useState, useRef } from "react";
import { motion, useScroll, useTransform, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useTheme } from "@/components/theme-provider";
import { useLanguage } from "@/components/language-provider";
import {
  ArrowRight,
  ChevronDown,
  Sprout,
  Map,
  Bot,
  BarChart3,
  Shield,
  Star,
  Check,
  Moon,
  Sun,
  Menu,
  X,
  Play,
  Tractor,
  Droplets,
Cloud,
  TrendingUp,
  UserRound,
  Rocket,
  Lightbulb,
  Target,
  Heart,
} from "lucide-react";

const fadeInUp = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6 } },
};

const staggerContainer = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.1, delayChildren: 0.2 },
  },
};


export default function LandingPage() {
  const { theme, toggleTheme } = useTheme();
  const { t } = useLanguage();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [faqOpen, setFaqOpen] = useState<number | null>(null);
  const [email, setEmail] = useState("");

  const features = [
    {
      icon: Map,
      title: t("landing.feature.mapTitle"),
      description: t("landing.feature.mapDescription"),
      color: "from-emerald-400 to-green-500",
    },
    {
      icon: Bot,
      title: t("landing.feature.aiTitle"),
      description: t("landing.feature.aiDescription"),
      color: "from-blue-400 to-indigo-500",
    },
    {
      icon: BarChart3,
      title: t("landing.feature.analyticsTitle"),
      description: t("landing.feature.analyticsDescription"),
      color: "from-purple-400 to-pink-500",
    },
    {
      icon: Tractor,
      title: t("landing.feature.fleetTitle"),
      description: t("landing.feature.fleetDescription"),
      color: "from-orange-400 to-red-500",
    },
    {
      icon: Droplets,
      title: t("landing.feature.weatherTitle"),
      description: t("landing.feature.weatherDescription"),
      color: "from-cyan-400 to-blue-500",
    },
    {
      icon: Shield,
      title: t("landing.feature.controlTitle"),
      description: t("landing.feature.controlDescription"),
      color: "from-green-400 to-emerald-500",
    },
  ];

  const testimonials = [
    {
      name: t("landing.testimonialSarahName"),
      role: t("landing.testimonialSarahRole"),
      content: t("landing.testimonialSarahContent"),
      rating: 5,
      location: t("landing.testimonialSarahLocation"),
    },
    {
      name: t("landing.testimonialJamesName"),
      role: t("landing.testimonialJamesRole"),
      content: t("landing.testimonialJamesContent"),
      rating: 5,
      location: t("landing.testimonialJamesLocation"),
    },
    {
      name: t("landing.testimonialMariaName"),
      role: t("landing.testimonialMariaRole"),
      content: t("landing.testimonialMariaContent"),
      rating: 5,
      location: t("landing.testimonialMariaLocation"),
    },
  ];

  const pricingPlans = [
    {
      name: t("landing.pricingStarterName"),
      price: "29",
      description: t("landing.pricingStarterDescription"),
      features: ["Up to 50 acres", "Basic analytics", "Weather forecasts", "Task management", "Email support"],
      popular: false,
    },
    {
      name: t("landing.pricingProfessionalName"),
      price: "79",
      description: t("landing.pricingProfessionalDescription"),
      features: ["Up to 500 acres", "Advanced analytics", "AI Assistant", "Farm map & fields", "Equipment tracking", "Priority support", "API access"],
      popular: true,
    },
    {
      name: t("landing.pricingEnterpriseName"),
      price: "199",
      description: t("landing.pricingEnterpriseDescription"),
      features: ["Unlimited acres", "Full analytics suite", "Premium AI features", "Unlimited users", "Custom integrations", "Dedicated support", "SLA guarantee", "On-premise option"],
      popular: false,
    },
  ];

  const faqs = [
    { q: t("landing.faqMapQuestion"), a: t("landing.faqMapAnswer") },
    { q: t("landing.faqEquipmentQuestion"), a: t("landing.faqEquipmentAnswer") },
    { q: t("landing.faqAccuracyQuestion"), a: t("landing.faqAccuracyAnswer") },
    { q: t("landing.faqSecurityQuestion"), a: t("landing.faqSecurityAnswer") },
    { q: t("landing.faqSupportQuestion"), a: t("landing.faqSupportAnswer") },
    { q: t("landing.faqTrialQuestion"), a: t("landing.faqTrialAnswer") },
  ];

  const heroRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: heroRef,
    offset: ["start start", "end start"],
  });
  const heroOpacity = useTransform(scrollYProgress, [0, 1], [1, 0]);
  const heroScale = useTransform(scrollYProgress, [0, 1], [1, 1.1]);

  return (
    <div className="min-h-screen bg-background">
      {/* Navbar */}
      <motion.nav
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        className="fixed top-0 left-0 right-0 z-50 glass border-b border-border"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-primary to-secondary flex items-center justify-center">
              <Sprout size={18} className="text-white" />
            </div>
            <span className="font-bold text-xl gradient-text">AgroVision</span>
          </div>

<div className="hidden md:flex items-center gap-8">
            {[{ key: "landing.navFeatures", href: "#features" }, { key: "landing.navDashboard", href: "#dashboard" }, { key: "landing.navPricing", href: "#pricing" }, { key: "landing.navFaq", href: "#faq" }, { key: "landing.navAbout", href: "#about" }].map((item) => (
              <Link
                key={item.key}
                href={item.href}
                className="text-sm text-muted-foreground hover:text-foreground transition-colors"
              >
                {t(item.key)}
              </Link>
            ))}
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={toggleTheme}
              className="p-2 rounded-xl hover:bg-muted transition-colors"
            >
              {theme === "light" ? <Moon size={18} /> : <Sun size={18} />}
            </button>
            <Link href="/login">
              <Button variant="ghost" size="sm" className="hidden sm:flex">
                {t("landing.signIn")}
              </Button>
            </Link>
            <Link href="/register">
              <Button size="sm" className="hidden sm:flex">
                {t("landing.getStarted")}
              </Button>
            </Link>
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 rounded-xl hover:bg-muted"
            >
              {mobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        <AnimatePresence>
          {mobileMenuOpen && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="md:hidden border-t border-border overflow-hidden"
            >
              <div className="px-4 py-4 space-y-2">
{[{ key: "landing.navFeatures", href: "#features" }, { key: "landing.navDashboard", href: "#dashboard" }, { key: "landing.navPricing", href: "#pricing" }, { key: "landing.navFaq", href: "#faq" }, { key: "landing.navAbout", href: "#about" }].map((item) => (
                  <Link
                    key={item.key}
                    href={item.href}
                    onClick={() => setMobileMenuOpen(false)}
                    className="block px-3 py-2 rounded-xl hover:bg-muted transition-colors text-sm"
                  >
                    {t(item.key)}
                  </Link>
                ))}
                <div className="flex gap-2 pt-2">
                  <Link href="/login" className="flex-1">
                    <Button variant="outline" className="w-full">
                      {t("landing.signIn")}
                    </Button>
                  </Link>
                  <Link href="/register" className="flex-1">
                    <Button className="w-full">{t("landing.getStarted")}</Button>
                  </Link>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.nav>

      {/* Hero Section */}
      <section ref={heroRef} className="relative min-h-screen flex items-center pt-16 overflow-hidden">
        {/* Background */}
        <motion.div style={{ opacity: heroOpacity, scale: heroScale }} className="absolute inset-0">
          <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-background to-secondary/5" />
          <div className="absolute inset-0" style={{
            backgroundImage: `radial-gradient(circle at 25% 25%, rgba(22, 163, 74, 0.03) 0%, transparent 50%), radial-gradient(circle at 75% 75%, rgba(5, 150, 105, 0.03) 0%, transparent 50%)`,
          }} />
          {/* Animated grid */}
          <div className="absolute inset-0 opacity-[0.03] dark:opacity-[0.05]" style={{
            backgroundImage: `linear-gradient(rgba(22, 163, 74, 1) 1px, transparent 1px), linear-gradient(90deg, rgba(22, 163, 74, 1) 1px, transparent 1px)`,
            backgroundSize: '60px 60px',
          }} />
        </motion.div>

        {/* Floating Elements */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          {[...Array(5)].map((_, i) => (
            <motion.div
              key={i}
              className="absolute"
              initial={{ opacity: 0 }}
              animate={{
                opacity: [0.3, 0.6, 0.3],
                y: [0, -30, 0],
                x: [0, Math.sin(i) * 20, 0],
              }}
              transition={{
                duration: 4 + i * 0.5,
                repeat: Infinity,
                delay: i * 0.5,
              }}
              style={{
                left: `${20 + i * 18}%`,
                top: `${30 + Math.sin(i * 2) * 15}%`,
              }}
            >
              {i % 2 === 0 ? (
                <Sprout size={24} className="text-primary/20" />
              ) : (
                <Tractor size={20} className="text-secondary/20" />
              )}
            </motion.div>
          ))}
        </div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 lg:py-32">
          <div className="max-w-4xl mx-auto text-center">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary/10 border border-primary/20 text-sm text-primary font-medium mb-8"
            >
              <Sprout size={14} />
              {t("landing.heroBadge")}
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="text-5xl sm:text-6xl lg:text-8xl font-bold tracking-tight mb-6"
            >
              {t("landing.heroTitle")}
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="text-lg sm:text-xl text-muted-foreground max-w-2xl mx-auto mb-10 leading-relaxed"
            >
              {t("landing.heroSubtitle")}
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.3 }}
              className="flex flex-col sm:flex-row items-center justify-center gap-4"
            >
              <Link href="/register">
                <Button size="xl" className="w-full sm:w-auto">
                  {t("landing.heroPrimary")}
                  <ArrowRight size={18} className="ml-2" />
                </Button>
              </Link>
              <Button variant="glass" size="xl" className="w-full sm:w-auto">
                <Play size={18} className="mr-2" />
                {t("landing.heroSecondary")}
              </Button>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.4 }}
              className="mt-12 flex items-center justify-center gap-8 text-sm text-muted-foreground"
            >
              <div className="flex items-center gap-2">
                <Check size={16} className="text-primary" />
                {t("landing.heroNoCard")}
              </div>
              <div className="flex items-center gap-2">
                <Check size={16} className="text-primary" />
                {t("landing.heroTrial")}
              </div>
              <div className="flex items-center gap-2">
                <Check size={16} className="text-primary" />
                {t("landing.heroCancel")}
              </div>
            </motion.div>
          </div>
        </div>

        {/* Scroll indicator */}
        <motion.div
          animate={{ y: [0, 10, 0] }}
          transition={{ duration: 2, repeat: Infinity }}
          className="absolute bottom-8 left-1/2 -translate-x-1/2"
        >
          <ChevronDown size={24} className="text-muted-foreground/50" />
        </motion.div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-24 lg:py-32">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
            variants={staggerContainer}
            className="text-center mb-16"
          >
            <motion.div variants={fadeInUp} className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary/10 border border-primary/20 text-sm text-primary font-medium mb-4">
              <Sprout size={14} />
              {t("landing.featuresBadge")}
            </motion.div>
            <motion.h2 variants={fadeInUp} className="text-4xl sm:text-5xl font-bold mb-4">
              {t("landing.featuresTitle")}
            </motion.h2>
            <motion.p variants={fadeInUp} className="text-lg text-muted-foreground max-w-2xl mx-auto">
              {t("landing.featuresSubtitle")}
            </motion.p>
          </motion.div>

          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
            variants={staggerContainer}
            className="grid md:grid-cols-2 lg:grid-cols-3 gap-6"
          >
            {features.map((feature, i) => (
              <motion.div
                key={i}
                variants={fadeInUp}
                className="glass-card p-8 group cursor-default"
              >
                <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${feature.color} p-3 mb-5 flex items-center justify-center`}>
                  <feature.icon size={24} className="text-white" />
                </div>
                <h3 className="text-xl font-semibold mb-3">{feature.title}</h3>
                <p className="text-muted-foreground leading-relaxed">{feature.description}</p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Dashboard Preview */}
      <section id="dashboard" className="py-24 lg:py-32 bg-muted/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={staggerContainer}
            className="text-center mb-16"
          >
            <motion.div variants={fadeInUp} className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary/10 border border-primary/20 text-sm text-primary font-medium mb-4">
              <BarChart3 size={14} />
              {t("landing.previewBadge")}
            </motion.div>
            <motion.h2 variants={fadeInUp} className="text-4xl sm:text-5xl font-bold mb-4">
              {t("landing.previewTitle")}
            </motion.h2>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 40, scale: 0.95 }}
            whileInView={{ opacity: 1, y: 0, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="relative"
          >
            <div className="glass rounded-3xl p-2 shadow-2xl green-glow">
              <div className="rounded-2xl overflow-hidden bg-background/80">
                <div className="p-4 border-b border-border flex items-center gap-2">
                  <div className="flex gap-1.5">
                    <div className="w-3 h-3 rounded-full bg-red-500/80" />
                    <div className="w-3 h-3 rounded-full bg-yellow-500/80" />
                    <div className="w-3 h-3 rounded-full bg-green-500/80" />
                  </div>
                  <div className="flex-1 text-center text-xs text-muted-foreground">dashboard.agrovizion.com</div>
                </div>
                <div className="p-6">
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                    {[
                      { label: t("landing.previewStatFields"), value: "5", change: "+2", color: "from-emerald-400 to-green-500" },
                      { label: t("landing.previewStatArea"), value: "195 ha", change: "Active", color: "from-blue-400 to-indigo-500" },
                      { label: t("landing.previewStatHealth"), value: "76%", change: "+8%", color: "from-green-400 to-emerald-500" },
                      { label: t("landing.previewStatRevenue"), value: "$124K", change: "+15%", color: "from-purple-400 to-pink-500" },
                    ].map((stat, i) => (
                      <div key={i} className="glass rounded-2xl p-4">
                        <p className="text-xs text-muted-foreground mb-1">{stat.label}</p>
                        <div className="flex items-baseline gap-2">
                          <span className="text-2xl font-bold">{stat.value}</span>
                          <span className={`text-xs font-medium ${stat.change.startsWith('+') ? 'text-green-500' : 'text-primary'}`}>{stat.change}</span>
                        </div>
                        <div className={`h-1.5 rounded-full bg-gradient-to-r ${stat.color} mt-2 opacity-60`} style={{ width: `${70 + i * 8}%` }} />
                      </div>
                    ))}
                  </div>
                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="glass rounded-2xl p-4">
                      <p className="text-sm font-medium mb-3">{t("landing.previewCropHealth")}</p>
                      <div className="space-y-3">
                        {["Wheat", "Corn", "Soybeans", "Apples"].map((crop, i) => (
                          <div key={i} className="flex items-center gap-3">
                            <span className="text-sm w-20">{crop}</span>
                            <div className="flex-1 h-2 rounded-full bg-muted overflow-hidden">
                              <div className="h-full rounded-full bg-green-500" style={{ width: `${85 - i * 10}%` }} />
                            </div>
                            <span className="text-sm font-medium">{85 - i * 10}%</span>
                          </div>
                        ))}
                      </div>
                    </div>
                    <div className="glass rounded-2xl p-4">
                      <p className="text-sm font-medium mb-3">{t("landing.previewWeather")}</p>
                      <div className="flex items-center gap-4">
                        <div className="w-16 h-16 rounded-2xl bg-yellow-500/10 flex items-center justify-center">
                          <Cloud size={28} className="text-yellow-500" />
                        </div>
                        <div>
                          <p className="text-3xl font-bold">22°C</p>
                          <p className="text-sm text-muted-foreground">{t("landing.previewWeatherCloudy")}</p>
                        </div>
                        <div className="flex-1 grid grid-cols-2 gap-2 text-sm text-muted-foreground">
                          <div>💧 65%</div>
                          <div>🌧 30%</div>
                          <div>💨 12 km/h</div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-24 lg:py-32">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={staggerContainer}
            className="text-center mb-16"
          >
            <motion.div variants={fadeInUp} className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary/10 border border-primary/20 text-sm text-primary font-medium mb-4">
              <Star size={14} />
              {t("landing.testimonialsBadge")}
            </motion.div>
            <motion.h2 variants={fadeInUp} className="text-4xl sm:text-5xl font-bold mb-4">
              {t("landing.testimonialsTitle")}
            </motion.h2>
          </motion.div>

          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={staggerContainer}
            className="grid md:grid-cols-3 gap-6"
          >
            {testimonials.map((testimonial, i) => (
              <motion.div key={i} variants={fadeInUp} className="glass-card p-8">
                <div className="flex gap-1 mb-4">
                  {[...Array(testimonial.rating)].map((_, j) => (
                    <Star key={j} size={16} className="fill-yellow-500 text-yellow-500" />
                  ))}
                </div>
                <p className="text-muted-foreground mb-6 leading-relaxed italic">&quot;{testimonial.content}&quot;</p>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary to-secondary flex items-center justify-center text-white font-bold text-sm">
                    {testimonial.name.split(" ").map(n => n[0]).join("")}
                  </div>
                  <div>
                    <p className="text-sm font-medium">{testimonial.name}</p>
                    <p className="text-xs text-muted-foreground">{testimonial.role} | {testimonial.location}</p>
                  </div>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* About Me / Founder Section */}
      <section id="about" className="py-24 lg:py-32 relative overflow-hidden bg-background">
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
<motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={staggerContainer}
            className="text-center mb-16"
          >
            <motion.div variants={fadeInUp} className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary/10 border border-primary/20 text-sm text-primary font-medium mb-4">
              <UserRound size={14} />
              About Me
            </motion.div>
            <motion.h2 variants={fadeInUp} className="text-4xl sm:text-5xl font-bold mb-4">
              The Founder Behind AgroVision
            </motion.h2>
          </motion.div>

          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={staggerContainer}
            className="max-w-5xl mx-auto"
          >
            {/* Founder intro card */}
            <motion.div variants={fadeInUp} className="glass-card glass-solid p-8 md:p-10 mb-6">
              <div className="flex flex-col md:flex-row items-center gap-6 md:gap-8 mb-8">
                <div className="w-28 h-28 md:w-36 md:h-36 rounded-3xl bg-gradient-to-br from-primary to-secondary flex items-center justify-center flex-shrink-0 shadow-lg">
                  <span className="text-4xl md:text-5xl font-bold text-white">AK</span>
                </div>
                <div className="text-center md:text-left">
                  <h3 className="text-2xl font-bold mb-1">Anastasios Karaivazoglou</h3>
                  <p className="text-primary font-medium mb-3">Founder &amp; Software Developer</p>
                  <p className="text-muted-foreground leading-relaxed">
                    Hi, I&apos;m Anastasios Karaivazoglou, the founder of AgroVision. I am a young entrepreneur
                    and software developer passionate about technology, artificial intelligence, and creating
                    solutions that can solve real-world problems. My goal is to use innovation to make complex
                    technologies simple, accessible, and useful for people who need them the most.
                  </p>
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <div className="glass glass-solid rounded-2xl p-5">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="w-9 h-9 rounded-xl bg-primary/10 text-primary flex items-center justify-center flex-shrink-0">
                      <Rocket size={16} />
                    </div>
                    <h4 className="font-semibold">The Vision</h4>
                  </div>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    AgroVision started from my vision of transforming agriculture through technology. I believe
                    that farmers should have access to powerful tools that help them understand their fields,
                    make better decisions, reduce waste, and improve productivity.
                  </p>
                </div>
                <div className="glass glass-solid rounded-2xl p-5">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="w-9 h-9 rounded-xl bg-green-500/10 text-green-500 flex items-center justify-center flex-shrink-0">
                      <Target size={16} />
                    </div>
                    <h4 className="font-semibold">Combining Technologies</h4>
                  </div>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    By combining artificial intelligence, satellite data, and smart sensor technology, AgroVision
                    aims to create a new generation of precision agriculture tools that bring data-driven
                    insights directly to farmers.
                  </p>
                </div>
                <div className="glass glass-solid rounded-2xl p-5 md:col-span-2">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="w-9 h-9 rounded-xl bg-purple-500/10 text-purple-500 flex items-center justify-center flex-shrink-0">
                      <Lightbulb size={16} />
                    </div>
                    <h4 className="font-semibold">The Dream</h4>
                  </div>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    My dream is to build a technology company that creates a real impact in the agricultural
                    industry and helps shape a more efficient, sustainable, and smarter future for farming.
                  </p>
                </div>
              </div>
            </motion.div>

            {/* Mission quote */}
            <motion.div variants={fadeInUp} className="glass-card glass-solid p-8 text-center">
              <Heart size={24} className="mx-auto mb-4 text-primary" />
              <p className="text-lg md:text-xl font-medium leading-relaxed max-w-3xl mx-auto">
"Agrovision is more than just a project it is my mission to connect technology with
                agriculture and create solutions that improve the way we grow food."
              </p>
              <p className="text-sm text-muted-foreground mt-4">Anastasios Karaivazoglou, Founder of AgroVision</p>
            </motion.div>
          </motion.div>
        </div>
      </section>

{/* Pricing Section */}
      <section id="pricing" className="py-24 lg:py-32 bg-muted/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={staggerContainer}
            className="text-center mb-16"
          >
            <motion.div variants={fadeInUp} className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary/10 border border-primary/20 text-sm text-primary font-medium mb-4">
              <TrendingUp size={14} />
              {t("landing.pricingBadge")}
            </motion.div>
            <motion.h2 variants={fadeInUp} className="text-4xl sm:text-5xl font-bold mb-4">
              {t("landing.pricingTitle")}
            </motion.h2>
          </motion.div>

          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={staggerContainer}
            className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto"
          >
            {pricingPlans.map((plan, i) => (
              <motion.div
                key={i}
                variants={fadeInUp}
                className={`glass-card p-8 relative ${plan.popular ? 'ring-2 ring-primary green-glow' : ''}`}
              >
                {plan.popular && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-4 py-1 rounded-full bg-primary text-white text-xs font-medium">
                    {t("landing.pricingMostPopular")}
                  </div>
                )}
                <div className="text-center mb-6">
                  <h3 className="text-lg font-semibold mb-1">{plan.name}</h3>
                  <p className="text-sm text-muted-foreground mb-4">{plan.description}</p>
                  <div className="flex items-baseline justify-center gap-1">
                    <span className="text-4xl font-bold">${plan.price}</span>
                    <span className="text-muted-foreground">/month</span>
                  </div>
                </div>
                <ul className="space-y-3 mb-8">
                  {plan.features.map((feature, j) => (
                    <li key={j} className="flex items-center gap-3 text-sm">
                      <Check size={16} className="text-primary flex-shrink-0" />
                      {feature}
                    </li>
                  ))}
                </ul>
<Link href="/pricing" className="block w-full">
                  <Button variant={plan.popular ? "default" : "outline"} className="w-full">
                    {plan.popular ? t("landing.pricingStartFreeTrial") : t("landing.pricingGetStarted")}
                    <ArrowRight size={16} className="ml-2" />
                  </Button>
                </Link>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* FAQ Section */}
      <section id="faq" className="py-24 lg:py-32">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={staggerContainer}
            className="text-center mb-16"
          >
            <motion.div variants={fadeInUp} className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary/10 border border-primary/20 text-sm text-primary font-medium mb-4">
              {t("landing.faqBadge")}
            </motion.div>
            <motion.h2 variants={fadeInUp} className="text-4xl sm:text-5xl font-bold mb-4">
              {t("landing.faqTitle")}
            </motion.h2>
          </motion.div>

          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={staggerContainer}
            className="space-y-4"
          >
            {faqs.map((faq, i) => (
              <motion.div key={i} variants={fadeInUp}>
                <button
                  onClick={() => setFaqOpen(faqOpen === i ? null : i)}
                  className="w-full glass-card p-6 text-left"
                >
                  <div className="flex items-center justify-between gap-4">
                    <span className="font-medium">{faq.q}</span>
                    <ChevronDown
                      size={18}
                      className={`text-muted-foreground flex-shrink-0 transition-transform duration-200 ${
                        faqOpen === i ? "rotate-180" : ""
                      }`}
                    />
                  </div>
                  <AnimatePresence>
                    {faqOpen === i && (
                      <motion.p
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        className="mt-4 text-muted-foreground leading-relaxed overflow-hidden"
                      >
                        {faq.a}
                      </motion.p>
                    )}
                  </AnimatePresence>
                </button>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 lg:py-32 bg-gradient-to-br from-primary/5 to-secondary/5">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={staggerContainer}
          >
            <motion.h2 variants={fadeInUp} className="text-4xl sm:text-5xl font-bold mb-4">
              {t("landing.ctaTitle")}
            </motion.h2>
            <motion.p variants={fadeInUp} className="text-lg text-muted-foreground mb-8 max-w-xl mx-auto">
              {t("landing.ctaSubtitle")}
            </motion.p>
            <motion.div variants={fadeInUp} className="flex flex-col sm:flex-row items-center justify-center gap-3 max-w-md mx-auto">
              <Input
                type="email"
                placeholder={t("landing.ctaPlaceholder")}
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="flex-1"
              />
              <Button size="lg" className="w-full sm:w-auto">
                {t("landing.ctaButton")}
                <ArrowRight size={18} className="ml-2" />
              </Button>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            <div className="col-span-2 md:col-span-1">
              <div className="flex items-center gap-2 mb-4">
                <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary to-secondary flex items-center justify-center">
                  <Sprout size={16} className="text-white" />
                </div>
                <span className="font-bold text-lg">AgroVision</span>
              </div>
              <p className="text-sm text-muted-foreground leading-relaxed">
                {t("landing.footerDescription")}
              </p>
            </div>
            {[
              { title: t("landing.footerProduct"), items: [t("landing.footerFeatures"), t("landing.footerPricing"), t("landing.footerDashboard"), t("landing.footerIntegrations")] },
              { title: t("landing.footerCompany"), items: [t("landing.footerAbout"), t("landing.footerBlog"), t("landing.footerCareers"), t("landing.footerContact")] },
              { title: t("landing.footerLegal"), items: [t("landing.footerPrivacy"), t("landing.footerTerms"), t("landing.footerSecurity"), t("landing.footerCookies")] },
            ].map((col, i) => (
              <div key={i}>
                <h4 className="font-semibold text-sm mb-4">{col.title}</h4>
                <ul className="space-y-2">
                  {col.items.map((item, j) => (
                    <li key={j}>
                      <Link href="#" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                        {item}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
          <div className="mt-12 pt-8 border-t border-border text-center text-sm text-muted-foreground">
            {t("landing.footerRights")}
          </div>
        </div>
      </footer>
    </div>
  );
}

