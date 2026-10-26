import { useParams, Link } from 'react-router-dom';
import { Zap, Building2, Users, GraduationCap, CheckCircle, ArrowRight } from 'lucide-react';

export default function CompanyLanding() {
  const { slug } = useParams();

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
              <Link to="/features" className="text-sm font-medium text-muted hover:text-primary transition-colors">Features</Link>
              <Link to="/products/smartboard" className="text-sm font-medium text-muted hover:text-primary transition-colors">SmartBoard</Link>
              <Link to="/products/faculty" className="text-sm font-medium text-muted hover:text-primary transition-colors">Faculty</Link>
              <Link to="/products/student" className="text-sm font-medium text-muted hover:text-primary transition-colors">Student</Link>
              <Link to="/pricing" className="text-sm font-medium text-muted hover:text-primary transition-colors">Pricing</Link>
            </div>
            <div className="hidden md:flex items-center gap-4">
              <Link to="/login" className="text-sm font-semibold text-primary hover:text-primary-hover transition-colors">Log in</Link>
              <Link to="/get-started" className="btn-primary w-auto h-10 px-6 text-sm">Get Started</Link>
            </div>
          </div>
        </nav>
      </header>

      <main className="flex-1 pt-16">
        <section className="relative overflow-hidden py-20 lg:py-32">
          <div className="mx-auto max-w-7xl px-6 lg:px-8">
            <div className="grid lg:grid-cols-2 gap-16 items-center">
              <div>
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary-light text-primary text-sm font-medium mb-6">
                  <Building2 className="h-4 w-4" />
                  <span>{slug?.charAt(0).toUpperCase() + slug?.slice(1)} Campus</span>
                </div>
                <h1 className="page-title mb-6">Welcome to {slug?.charAt(0).toUpperCase() + slug?.slice(1)}</h1>
                <p className="page-subtitle mb-10">Your institution's intelligent campus management platform. Access your personalized dashboard and manage attendance, schedules, and communications.</p>
                <div className="flex flex-col sm:flex-row gap-4">
                  <Link to={`/company-login?company=${slug}`} className="btn-primary w-full sm:w-auto">
                    Access Portal
                    <ArrowRight className="h-5 w-5 ml-2" />
                  </Link>
                  <Link to="/contact" className="btn-secondary w-full sm:w-auto">Contact Admin</Link>
                </div>
              </div>
              <div className="relative">
                <div className="card-elevated p-8">
                  <div className="flex items-center gap-3 mb-6">
                    <div className="w-12 h-12 rounded-xl bg-primary flex items-center justify-center">
                      <Building2 className="h-6 w-6 text-white" />
                    </div>
                    <div>
                      <h3 className="font-display text-lg font-bold text-primary">{slug?.charAt(0).toUpperCase() + slug?.slice(1)}</h3>
                      <p className="text-sm text-muted">IntelliAttend Campus Portal</p>
                    </div>
                  </div>
                  <div className="space-y-4">
                    <div className="flex items-center gap-3 p-3 rounded-lg bg-slate-50">
                      <CheckCircle className="h-5 w-5 text-accent flex-shrink-0" />
                      <span className="text-sm text-primary">AI Attendance Tracking</span>
                    </div>
                    <div className="flex items-center gap-3 p-3 rounded-lg bg-slate-50">
                      <CheckCircle className="h-5 w-5 text-accent flex-shrink-0" />
                      <span className="text-sm text-primary">Smart Scheduling</span>
                    </div>
                    <div className="flex items-center gap-3 p-3 rounded-lg bg-slate-50">
                      <CheckCircle className="h-5 w-5 text-accent flex-shrink-0" />
                      <span className="text-sm text-primary">Unified Communication</span>
                    </div>
                    <div className="flex items-center gap-3 p-3 rounded-lg bg-slate-50">
                      <CheckCircle className="h-5 w-5 text-accent flex-shrink-0" />
                      <span className="text-sm text-primary">Advanced Analytics</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="py-20 lg:py-32 bg-slate-50" aria-labelledby="features-heading">
          <div className="mx-auto max-w-7xl px-6 lg:px-8">
            <h2 id="features-heading" className="sr-only">Platform Features</h2>
            <div className="grid md:grid-cols-3 gap-8">
              {[
                { icon: GraduationCap, title: 'Student Portal', desc: 'Attendance, schedules, grades, and resources' },
                { icon: Users, title: 'Faculty Portal', desc: 'Class management, attendance, and analytics' },
                { icon: Building2, title: 'Admin Dashboard', desc: 'Institution-wide oversight and controls' },
              ].map((feature, index) => (
                <div key={index} className="card-elevated p-6 text-center">
                  <div className="w-14 h-14 rounded-xl bg-primary-light flex items-center justify-center mx-auto mb-4">
                    <feature.icon className="h-7 w-7 text-primary" />
                  </div>
                  <h3 className="font-display text-lg font-semibold text-primary mb-2">{feature.title}</h3>
                  <p className="text-sm text-muted">{feature.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>
      </main>

      <footer className="bg-white border-t border-slate-100 pt-20 pb-10">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
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