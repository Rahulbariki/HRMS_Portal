import { Link } from 'react-router-dom';
import { Zap, Shield, Users, BarChart3, Calendar, CheckCircle, ArrowRight, MessageSquare } from 'lucide-react';

const features = [
  {
    icon: Zap,
    title: 'AI-Powered Attendance',
    description: 'Automated attendance tracking using computer vision and facial recognition. Eliminate manual roll calls and reduce proxy attendance.',
    details: ['Real-time face recognition', 'Geofencing for location verification', 'Offline sync capability', 'Multi-device support'],
  },
  {
    icon: Calendar,
    title: 'Smart Scheduling',
    description: 'Intelligent timetable management with conflict resolution, room allocation, and real-time updates for faculty and students.',
    details: ['Drag-and-drop scheduler', 'Conflict detection', 'Room & resource booking', 'Recurring events'],
  },
  {
    icon: BarChart3,
    title: 'Advanced Analytics',
    description: 'Comprehensive dashboards with attendance trends, engagement metrics, and predictive analytics for academic performance.',
    details: ['Custom report builder', 'Export to PDF/Excel', 'Scheduled reports', 'Real-time alerts'],
  },
  {
    icon: MessageSquare,
    title: 'Unified Communication',
    description: 'Built-in messaging, announcements, and notifications system connecting faculty, students, and administration.',
    details: ['In-app messaging', 'Push notifications', 'Email integration', 'Announcement broadcasts'],
  },
  {
    icon: Shield,
    title: 'Enterprise Security',
    description: 'Bank-grade encryption, role-based access control, audit logs, and compliance with educational data regulations.',
    details: ['SOC 2 Type II certified', 'GDPR & FERPA compliant', 'SSO/SAML support', 'Audit trails'],
  },
  {
    icon: Users,
    title: 'Multi-Role Portals',
    description: 'Dedicated portals for Super Admin, Institution Admin, Faculty, and Students with role-specific features.',
    details: ['Role-based permissions', 'Custom dashboards', 'Workflow automation', 'Approval chains'],
  },
];

export default function FeaturesPage() {
  return (
    <div className="flex flex-col min-h-screen bg-white">
      <header className="fixed top-0 left-0 right-0 z-50 bg-white/90 backdrop-blur-sm border-b border-slate-100">
        <nav className="mx-auto max-w-7xl px-6 lg:px-8" aria-label="Main navigation">
          <div className="flex h-16 items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-9 h-9 rounded-xl bg-primary flex items-center justify-center">
                <Zap className="h-5 w-5 text-white" />
              </div>
              <span className="font-display font-bold text-xl text-primary">IntelliAttend</span>
            </div>
            <div className="hidden md:flex items-center gap-8">
              <Link to="/features" className="text-sm font-medium text-primary">Features</Link>
              <Link to="/products/smartboard" className="text-sm font-medium text-muted hover:text-primary transition-colors">SmartBoard</Link>
              <Link to="/products/faculty" className="text-sm font-medium text-muted hover:text-primary transition-colors">Faculty</Link>
              <Link to="/products/student" className="text-sm font-medium text-muted hover:text-primary transition-colors">Student</Link>
              <Link to="/pricing" className="text-sm font-medium text-muted hover:text-primary transition-colors">Pricing</Link>
              <Link to="/about" className="text-sm font-medium text-muted hover:text-primary transition-colors">About</Link>
              <Link to="/blog" className="text-sm font-medium text-muted hover:text-primary transition-colors">Blog</Link>
            </div>
            <div className="hidden md:flex items-center gap-4">
              <Link to="/login" className="text-sm font-semibold text-primary hover:text-primary-hover transition-colors">Log in</Link>
              <Link to="/get-started" className="btn-primary w-auto h-10 px-6 text-sm">Get Started</Link>
            </div>
          </div>
        </nav>
      </header>

      <main className="flex-1 pt-16">
        <section className="relative overflow-hidden py-20 lg:py-32" aria-labelledby="features-hero-heading">
          <div className="mx-auto max-w-7xl px-6 lg:px-8">
            <div className="text-center max-w-3xl mx-auto">
              <h1 id="features-hero-heading" className="page-title mb-6">Powerful features for modern campuses</h1>
              <p className="page-subtitle mx-auto mb-10">Everything you need to manage attendance, schedules, communication, and analytics in one intelligent platform.</p>
              <Link href="/get-started" className="btn-primary w-auto inline-flex">
                Start Free Trial
                <ArrowRight className="h-5 w-5 ml-2" />
              </Link>
            </div>
          </div>
        </section>

        <section className="py-20 lg:py-32" aria-labelledby="features-list-heading">
          <div className="mx-auto max-w-7xl px-6 lg:px-8">
            <h2 id="features-list-heading" className="sr-only">Feature Details</h2>
            <div className="space-y-16">
              {features.map((feature, index) => (
                <article key={index} className="grid lg:grid-cols-2 gap-12 items-center" style={{ opacity: 0, transform: 'translateY(20px)' }}>
                  <div className={index % 2 === 1 ? 'lg:order-2' : ''}>
                    <div className="w-16 h-16 rounded-2xl bg-primary-light flex items-center justify-center mb-6">
                      <feature.icon className="h-8 w-8 text-primary" />
                    </div>
                    <h3 className="font-display text-3xl font-bold text-primary mb-4">{feature.title}</h3>
                    <p className="text-muted text-lg mb-6">{feature.description}</p>
                    <ul className="space-y-3">
                      {feature.details.map((detail, i) => (
                        <li key={i} className="flex items-center gap-3 text-muted">
                          <CheckCircle className="h-5 w-5 text-accent flex-shrink-0" />
                          <span>{detail}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                  <div className={index % 2 === 1 ? 'lg:order-1' : ''}>
                    <div className="aspect-video rounded-2xl bg-slate-100 flex items-center justify-center relative overflow-hidden">
                      <div className="text-center p-8">
                        <feature.icon className="h-24 w-24 mx-auto text-muted/20 mb-4" />
                        <p className="text-muted">{feature.title} interface preview</p>
                      </div>
                      <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-accent/5 opacity-50" />
                    </div>
                  </div>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section className="py-20 lg:py-32 bg-primary" aria-labelledby="cta-heading">
          <div className="mx-auto max-w-7xl px-6 lg:px-8 text-center">
            <h2 id="cta-heading" className="text-4xl md:text-5xl font-bold text-white mb-6">Ready to transform your campus?</h2>
            <p className="text-white/80 text-lg mb-10 max-w-2xl mx-auto">Join thousands of institutions already using IntelliAttend to streamline their academic operations.</p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/get-started" className="btn-primary w-full sm:w-auto">
                Get Started Now
              </Link>
              <Link href="/contact" className="btn-secondary w-full sm:w-auto border-white text-white hover:bg-white hover:text-primary">
                Contact Sales
              </Link>
            </div>
          </div>
        </section>
      </main>

      <footer className="bg-white border-t border-slate-100 pt-20 pb-10">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-12 mb-16">
            <div className="col-span-2 md:col-span-1">
              <Link href="/" className="flex items-center gap-2 mb-6">
                <div className="w-9 h-9 rounded-xl bg-primary flex items-center justify-center">
                  <Zap className="h-5 w-5 text-white" />
                </div>
                <span className="font-display font-bold text-lg text-primary">IntelliAttend</span>
              </Link>
              <p className="text-sm text-muted mb-6 max-w-xs">The intelligent foundation for modern educational institutions.</p>
            </div>
            <div>
              <h4 className="font-semibold text-primary mb-4">Product</h4>
              <ul className="space-y-3">
                <li><Link href="/features" className="text-sm text-muted hover:text-primary transition-colors">Features</Link></li>
                <li><Link href="/get-started" className="text-sm text-muted hover:text-primary transition-colors">Get Started</Link></li>
                <li><Link href="/products/smartboard" className="text-sm text-muted hover:text-primary transition-colors">SmartBoard</Link></li>
                <li><Link href="/products/faculty" className="text-sm text-muted hover:text-primary transition-colors">Faculty</Link></li>
                <li><Link href="/products/student" className="text-sm text-muted hover:text-primary transition-colors">Student</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-primary mb-4">Company</h4>
              <ul className="space-y-3">
                <li><Link href="/about" className="text-sm text-muted hover:text-primary transition-colors">About Us</Link></li>
                <li><Link href="/careers" className="text-sm text-muted hover:text-primary transition-colors">Careers</Link></li>
                <li><Link href="/contact" className="text-sm text-muted hover:text-primary transition-colors">Contact</Link></li>
                <li><Link href="/blog" className="text-sm text-muted hover:text-primary transition-colors">Blog</Link></li>
                <li><Link href="/support" className="text-sm text-muted hover:text-primary transition-colors">Support</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-primary mb-4">Legal</h4>
              <ul className="space-y-3">
                <li><Link href="/privacy" className="text-sm text-muted hover:text-primary transition-colors">Privacy Policy</Link></li>
                <li><Link href="/terms" className="text-sm text-muted hover:text-primary transition-colors">Terms of Service</Link></li>
                <li><Link href="/cookies" className="text-sm text-muted hover:text-primary transition-colors">Cookie Policy</Link></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-slate-100 pt-8 flex flex-col md:flex-row items-center justify-between gap-4">
            <p className="text-sm text-muted">© 2026 IntelliAttend Inc. All rights reserved.</p>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-green-500" />
              <span className="text-sm text-muted">All systems operational</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}