import { Link } from 'react-router-dom';
import {
  Zap, Shield, Users, BarChart3, Calendar, CheckCircle,
  ArrowRight, GraduationCap, BookOpen, MessageSquare, Monitor
} from 'lucide-react';

const features = [
  {
    icon: Zap,
    title: 'AI-Powered Attendance',
    description: 'Automated attendance tracking using computer vision and facial recognition. Eliminate manual roll calls and reduce proxy attendance.',
  },
  {
    icon: Calendar,
    title: 'Smart Scheduling',
    description: 'Intelligent timetable management with conflict resolution, room allocation, and real-time updates for faculty and students.',
  },
  {
    icon: BarChart3,
    title: 'Advanced Analytics',
    description: 'Comprehensive dashboards with attendance trends, engagement metrics, and predictive analytics for academic performance.',
  },
  {
    icon: MessageSquare,
    title: 'Unified Communication',
    description: 'Built-in messaging, announcements, and notifications system connecting faculty, students, and administration.',
  },
  {
    icon: Shield,
    title: 'Enterprise Security',
    description: 'Bank-grade encryption, role-based access control, audit logs, and compliance with educational data regulations.',
  },
  {
    icon: Users,
    title: 'Multi-Role Portals',
    description: 'Dedicated portals for Super Admin, Institution Admin, Faculty, and Students with role-specific features and permissions.',
  },
];

const products = [
  {
    icon: Monitor,
    title: 'SmartBoard',
    description: 'Interactive classroom displays with real-time attendance, content sharing, and collaborative tools.',
    link: '/products/smartboard',
  },
  {
    icon: GraduationCap,
    title: 'Faculty Portal',
    description: 'Complete faculty dashboard for attendance, grading, scheduling, and student communication.',
    link: '/products/faculty',
  },
  {
    icon: BookOpen,
    title: 'Student App',
    description: 'Mobile-first student experience with attendance tracking, schedules, resources, and notifications.',
    link: '/products/student',
  },
];

const stats = [
  { value: '500+', label: 'Institutions' },
  { value: '2M+', label: 'Active Users' },
  { value: '99.9%', label: 'Uptime' },
  { value: '50M+', label: 'Records Processed' },
];

const testimonials = [
  {
    quote: "IntelliAttend transformed how we manage attendance across our 5 campuses. The AI accuracy is remarkable and saved our faculty hundreds of hours.",
    author: "Dr. Sarah Chen",
    role: "Vice Chancellor, Tech University",
    avatar: "SC",
  },
  {
    quote: "The SmartBoard integration is a game-changer. Students are more engaged, and we have real-time visibility into classroom participation.",
    author: "Prof. Michael Roberts",
    role: "Dean of Engineering, State College",
    avatar: "MR",
  },
  {
    quote: "Implementation was seamless. The team understood our unique needs and customized the platform perfectly for our K-12 district.",
    author: "Jennifer Martinez",
    role: "IT Director, Metro School District",
    avatar: "JM",
  },
];

export default function LandingPage() {
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
              <Link href="/features" className="text-sm font-medium text-muted hover:text-primary transition-colors">Features</Link>
              <Link href="/products/smartboard" className="text-sm font-medium text-muted hover:text-primary transition-colors">SmartBoard</Link>
              <Link href="/products/faculty" className="text-sm font-medium text-muted hover:text-primary transition-colors">Faculty</Link>
              <Link href="/products/student" className="text-sm font-medium text-muted hover:text-primary transition-colors">Student</Link>
              <Link href="/pricing" className="text-sm font-medium text-muted hover:text-primary transition-colors">Pricing</Link>
              <Link href="/about" className="text-sm font-medium text-muted hover:text-primary transition-colors">About</Link>
              <Link href="/blog" className="text-sm font-medium text-muted hover:text-primary transition-colors">Blog</Link>
            </div>
            <div className="hidden md:flex items-center gap-4">
              <Link href="/login" className="text-sm font-semibold text-primary hover:text-primary-hover transition-colors">Log in</Link>
              <Link href="/get-started" className="btn-primary w-auto h-10 px-6 text-sm">Get Started</Link>
            </div>
          </div>
        </nav>
      </header>

      <main className="flex-1 pt-16">
        <section className="relative overflow-hidden py-20 lg:py-32" aria-labelledby="hero-heading">
          <div className="mx-auto max-w-7xl px-6 lg:px-8">
            <div className="grid lg:grid-cols-2 gap-16 items-center">
              <div>
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary-light text-primary text-sm font-medium mb-6">
                  <Zap className="h-4 w-4" />
                  <span>New: AI Attendance v2.0 with 99.8% accuracy</span>
                </div>
                <h1 id="hero-heading" className="page-title mb-6">
                  Intelligent Attendance.<br />
                  <span className="text-accent">Smart Campus.</span>
                </h1>
                <p className="page-subtitle mb-10">
                  Manage attendance, schedules, SmartBoard, notifications, analytics and communication from one intelligent platform. Trusted by universities and schools worldwide.
                </p>
                <div className="flex flex-col sm:flex-row gap-4 mb-16">
                  <Link href="/get-started" className="btn-primary w-full sm:w-auto">
                    Get Started Free
                    <ArrowRight className="h-5 w-5 ml-2" />
                  </Link>
                  <Link href="/contact" className="btn-secondary w-full sm:w-auto">
                    Contact Sales
                  </Link>
                </div>
                <div className="flex flex-wrap items-center gap-6 text-sm text-muted">
                  <div className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-accent" />
                    <span>No credit card required</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-accent" />
                    <span>14-day free trial</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-accent" />
                    <span>Cancel anytime</span>
                  </div>
                </div>
              </div>
              <div className="relative">
                <div className="relative z-10 rounded-2xl border border-slate-200 bg-white shadow-2xl overflow-hidden">
                  <div className="flex items-center gap-2 px-4 py-3 bg-slate-50 border-b border-slate-100">
                    <div className="flex gap-1.5">
                      <div className="w-3 h-3 rounded-full bg-red-400" />
                      <div className="w-3 h-3 rounded-full bg-yellow-400" />
                      <div className="w-3 h-3 rounded-full bg-green-400" />
                    </div>
                    <div className="flex-1 text-center text-sm text-muted font-mono">app.intelliattend.com/dashboard</div>
                  </div>
                  <div className="p-6 bg-slate-50 h-[400px] flex items-center justify-center">
                    <div className="grid grid-cols-3 gap-4 max-w-md">
                      <div className="bg-white rounded-xl p-4 border border-slate-100 shadow-sm">
                        <div className="flex items-center gap-2 mb-3">
                          <div className="w-2 h-2 rounded-full bg-green-400" />
                          <span className="text-xs font-medium text-primary">CS101 - Intro to CS</span>
                        </div>
                        <div className="text-3xl font-bold text-primary">94%</div>
                        <div className="text-xs text-muted">Attendance Rate</div>
                      </div>
                      <div className="bg-white rounded-xl p-4 border border-slate-100 shadow-sm">
                        <div className="flex items-center gap-2 mb-3">
                          <div className="w-2 h-2 rounded-full bg-blue-400" />
                          <span className="text-xs font-medium text-primary">ENG201 - Literature</span>
                        </div>
                        <div className="text-3xl font-bold text-primary">87%</div>
                        <div className="text-xs text-muted">Attendance Rate</div>
                      </div>
                      <div className="bg-white rounded-xl p-4 border border-slate-100 shadow-sm">
                        <div className="flex items-center gap-2 mb-3">
                          <div className="w-2 h-2 rounded-full bg-yellow-400" />
                          <span className="text-xs font-medium text-primary">MATH301 - Calculus</span>
                        </div>
                        <div className="text-3xl font-bold text-primary">91%</div>
                        <div className="text-xs text-muted">Attendance Rate</div>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="absolute -top-4 -right-4 w-72 h-72 bg-accent-light rounded-full blur-3xl opacity-50" aria-hidden="true" />
                <div className="absolute -bottom-8 -left-8 w-96 h-96 bg-primary-light rounded-full blur-3xl opacity-30" aria-hidden="true" />
              </div>
            </div>
          </div>
        </section>

        <section className="py-16 bg-slate-50 border-y border-slate-100" aria-labelledby="stats-heading">
          <div className="mx-auto max-w-7xl px-6 lg:px-8">
            <h2 id="stats-heading" className="sr-only">Platform Statistics</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
              {stats.map((stat) => (
                <div key={stat.label} className="text-center">
                  <div className="font-display text-4xl md:text-5xl font-bold text-primary">{stat.value}</div>
                  <div className="mt-2 text-muted">{stat.label}</div>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="py-20 lg:py-32" aria-labelledby="features-heading">
          <div className="mx-auto max-w-7xl px-6 lg:px-8">
            <div className="text-center max-w-3xl mx-auto mb-16">
              <h2 id="features-heading" className="page-title mb-6">Everything you need for a smart campus</h2>
              <p className="page-subtitle mx-auto">Powerful features designed for modern educational institutions</p>
            </div>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {features.map((feature, index) => (
                <article key={index} className="card-elevated p-6 hover:shadow-xl transition-shadow">
                  <div className="w-12 h-12 rounded-xl bg-primary-light flex items-center justify-center mb-4">
                    <feature.icon className="h-6 w-6 text-primary" />
                  </div>
                  <h3 className="font-display text-lg font-semibold text-primary mb-2">{feature.title}</h3>
                  <p className="text-muted">{feature.description}</p>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section className="py-20 lg:py-32 bg-primary" aria-labelledby="products-heading">
          <div className="mx-auto max-w-7xl px-6 lg:px-8">
            <div className="text-center max-w-3xl mx-auto mb-16">
              <h2 id="products-heading" className="text-4xl md:text-5xl font-bold text-white mb-6">Three products, one platform</h2>
              <p className="text-white/80 text-lg">Choose the solution that fits your institution's needs</p>
            </div>
            <div className="grid md:grid-cols-3 gap-8">
              {products.map((product, index) => (
                <article key={index} className="card-elevated p-8 relative overflow-hidden">
                  <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full blur-2xl" aria-hidden="true" />
                  <div className="relative z-10">
                    <div className="w-14 h-14 rounded-xl bg-white/10 flex items-center justify-center mb-6 backdrop-blur-sm">
                      <product.icon className="h-7 w-7 text-white" />
                    </div>
                    <h3 className="font-display text-xl font-semibold text-white mb-3">{product.title}</h3>
                    <p className="text-white/70 mb-6">{product.description}</p>
                    <Link
                      to={product.link}
                      className="inline-flex items-center gap-2 text-white/80 hover:text-white font-medium text-sm transition-colors"
                    >
                      Learn more
                      <ArrowRight className="h-4 w-4" />
                    </Link>
                  </div>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section className="py-20 lg:py-32" aria-labelledby="testimonials-heading">
          <div className="mx-auto max-w-7xl px-6 lg:px-8">
            <div className="text-center max-w-3xl mx-auto mb-16">
              <h2 id="testimonials-heading" className="page-title mb-6">Trusted by leading institutions</h2>
              <p className="page-subtitle mx-auto">See what educators and administrators have to say</p>
            </div>
            <div className="grid md:grid-cols-3 gap-8">
              {testimonials.map((testimonial, index) => (
                <article key={index} className="card-elevated p-8">
                  <div className="flex gap-1 mb-6">
                    {[...Array(5)].map((_, i) => (
                      <svg key={i} className="h-5 w-5 text-yellow-400" fill="currentColor" viewBox="0 0 20 20"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" /></svg>
                    ))}
                  </div>
                  <p className="text-muted mb-6">"{testimonial.quote}"</p>
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-primary-light flex items-center justify-center">
                      <span className="font-display font-semibold text-primary text-sm">{testimonial.avatar}</span>
                    </div>
                    <div>
                      <p className="font-semibold text-primary">{testimonial.author}</p>
                      <p className="text-sm text-muted">{testimonial.role}</p>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section className="py-20 lg:py-32 bg-slate-50" aria-labelledby="cta-heading">
          <div className="mx-auto max-w-7xl px-6 lg:px-8 text-center">
            <h2 id="cta-heading" className="page-title mb-6">Ready to transform your campus?</h2>
            <p className="page-subtitle mx-auto mb-10">Join thousands of institutions already using IntelliAttend to streamline their academic operations.</p>
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