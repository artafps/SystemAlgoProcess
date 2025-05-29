import { Logo } from "@/once-ui/components";

const person = {
  firstName: "ARTA",
  lastName: "FPS",
  get name() {
    return `${this.firstName} ${this.lastName}`;
  },
  role: "Design Engineer",
  avatar: "/images/avatar.jpg",
  email: "artafallahpoor@gmail.com",
  location: "Iran", // Expecting the IANA time zone identifier, e.g., 'Europe/Vienna'
  languages: ["English", "Bahasa"], // optional: Leave the array empty if you don't want to display languages
};

const newsletter = {
  display: true,
  title: <>Subscribe to {person.firstName}'s Newsletter</>,
  description: (
    <>
      I occasionally write about design, technology, and share thoughts on the intersection of
      creativity and engineering.
    </>
  ),
};

const social = [
  // Links are automatically displayed.
  // Import new icons in /once-ui/icons.ts
  {
    name: "GitHub",
    icon: "github",
    link: "https://github.com/artafps",
  }, {
    name: "Telegram",
    icon: "telegram",
    link: "https://t.me/artafps",
  },
  {
    name: "LinkedIn",
    icon: "linkedin",
    link: "https://www.linkedin.com/in/artafps/",
  },
  {
    name: "Instagram",
    icon: "instagram",
    link: "https://www.instagram.com/artafps/",
  },
  {
    name: "Email",
    icon: "email",
    link: `mailto:${person.email}`,
  },
];

const home = {
  path: "/",
  image: "/images/og/home.jpg",
  label: "Home",
  title: `${person.name}'s Portfolio`,
  description: `Portfolio website showcasing my work as a ${person.role}`,
  headline: <>🧠 شبیه‌ساز الگوریتم‌های زمان‌بندی پردازش‌ها</>,
  featured: {
    display: true,
    title: <> پروژه های درس اصول سیستم عامل  |  مدرس : دکتر جمالیان</>,
    href: "",
  },
  subline: (
    <>
این صفحه امکان مشاهده تعاملی عملکرد الگوریتم‌های زمان‌بندی فرآیندها از جمله FIFO، SPN و HRRN را فراهم می‌آورد. با ورود داده‌های فرآیندها، نتایج شبیه‌سازی شامل نمودار گانت، جداول مقایسه‌ای و میانگین زمان‌های مرتبط به‌صورت دقیق ارائه می‌گردد تا تفاوت‌ها و ویژگی‌های هر الگوریتم به‌روشنی قابل تحلیل باشد.

این پروژه به عنوان تکلیف درس اصول سیستم‌عامل در دانشگاه گیلان، زیر نظر استاد دکتر جمالیان ارائه شده است.

روند کار با سامانه بسیار ساده بوده و پس از انجام تنظیمات اولیه، کاربر می‌تواند نتایج اجرای الگوریتم‌ها را به‌صورت تصویری و عددی مشاهده نماید.

همچنین، از مشارکت و پیشنهادات ارزشمند کاربران جهت توسعه و افزودن الگوریتم‌های جدید به این سامانه استقبال می‌گردد.  </>
  ),
};

const about = {
  path: "/about",
  label: "About",
  title: `About – ${person.name}`,
  description: `Meet ${person.name}, ${person.role} from ${person.location}`,
  tableOfContent: {
    display: true,
    subItems: false,
  },
  avatar: {
    display: true,
  },
  calendar: {
    display: true,
    link: "https://cal.com",
  },
  intro: {
    display: true,
    title: "Introduction",
    description: (
      <>
        Selene is a Jakarta-based design engineer with a passion for transforming complex challenges
        into simple, elegant design solutions. Her work spans digital interfaces, interactive
        experiences, and the convergence of design and technology.
      </>
    ),
  },
  work: {
    display: true, // set to false to hide this section
    title: "Work Experience",
    experiences: [
      {
        company: "FLY",
        timeframe: "2022 - Present",
        role: "Senior Design Engineer",
        achievements: [
          <>
            Redesigned the UI/UX for the FLY platform, resulting in a 20% increase in user
            engagement and 30% faster load times.
          </>,
          <>
            Spearheaded the integration of AI tools into design workflows, enabling designers to
            iterate 50% faster.
          </>,
        ],
        images: [
          // optional: leave the array empty if you don't want to display images
          {
            src: "/images/projects/project-01/cover-01.jpg",
            alt: "Once UI Project",
            width: 16,
            height: 9,
          },
        ],
      },
      {
        company: "Creativ3",
        timeframe: "2018 - 2022",
        role: "Lead Designer",
        achievements: [
          <>
            Developed a design system that unified the brand across multiple platforms, improving
            design consistency by 40%.
          </>,
          <>
            Led a cross-functional team to launch a new product line, contributing to a 15% increase
            in overall company revenue.
          </>,
        ],
        images: [],
      },
    ],
  },
  studies: {
    display: true, // set to false to hide this section
    title: "Studies",
    institutions: [
      {
        name: "University of Jakarta",
        description: <>Studied software engineering.</>,
      },
      {
        name: "Build the Future",
        description: <>Studied online marketing and personal branding.</>,
      },
    ],
  },
  technical: {
    display: true, // set to false to hide this section
    title: "Technical skills",
    skills: [
      {
        title: "Figma",
        description: <>Able to prototype in Figma with Once UI with unnatural speed.</>,
        // optional: leave the array empty if you don't want to display images
        images: [
          {
            src: "/images/projects/project-01/cover-02.jpg",
            alt: "Project image",
            width: 16,
            height: 9,
          },
          {
            src: "/images/projects/project-01/cover-03.jpg",
            alt: "Project image",
            width: 16,
            height: 9,
          },
        ],
      },
      {
        title: "Next.js",
        description: <>Building next gen apps with Next.js + Once UI + Supabase.</>,
        // optional: leave the array empty if you don't want to display images
        images: [
          {
            src: "/images/projects/project-01/cover-04.jpg",
            alt: "Project image",
            width: 16,
            height: 9,
          },
        ],
      },
    ],
  },
};

const blog = {
  path: "/blog",
  label: "بلاگ",
  title: "در اینجا چند وبلاگ آموزشی برایتان تدارک دیده ایم",
  description: `Read what ${person.name} has been up to recently`,
  // Create new blog posts by adding a new .mdx file to app/blog/posts
  // All posts will be listed on the /blog route
};

const work = {
  path: "/setting",
  label: "تنظیمات اولیه",
  title: `Projects – ${person.name}`,
  description: `Design and dev projects by ${person.name}`,
  // Create new project pages by adding a new .mdx file to app/blog/posts
  // All projects will be listed on the /home and /work routes
};

const algo = {
  path: "/algo",
  label: "نمودار ها",
  title: `Photo algo – ${person.name}`,
  description: `A photo collection by ${person.name}`,
  // Images by https://lorant.one
  // These are placeholder images, replace with your own

};

export { person, social, newsletter, home, about, blog, work, algo };
