import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  console.log("Checking database state for seeding...");

  // 1. Seed Users (Admin & Students)
  console.log("Checking Admin account...");
  const adminEmail = "admin@edupilot.ai";
  let adminUser = await prisma.user.findUnique({ where: { email: adminEmail } });
  
  if (!adminUser) {
    console.log("Seeding Administrator account...");
    const adminSalt = await bcrypt.genSalt(10);
    const adminPassword = await bcrypt.hash("admin123", adminSalt);
    adminUser = await prisma.user.create({
      data: {
        name: "Professor Charles",
        email: adminEmail,
        password: adminPassword,
        role: "ADMIN",
        avatar: "https://api.dicebear.com/7.x/adventurer/svg?seed=Charles",
      },
    });
  }

  console.log("Checking 30 Student accounts...");
  const studentSalt = await bcrypt.genSalt(10);
  const students = [];
  for (let i = 1; i <= 30; i++) {
    const email = `student${i}@edupilot.ai`;
    let stud = await prisma.user.findUnique({ where: { email } });
    if (!stud) {
      console.log(`Seeding Student ${i}...`);
      const studentPassword = await bcrypt.hash(`student${i}23`, studentSalt);
      stud = await prisma.user.create({
        data: {
          name: `Student Learner ${i}`,
          email,
          password: studentPassword,
          role: "STUDENT",
          avatar: `https://api.dicebear.com/7.x/adventurer/svg?seed=student${i}`,
          skills: i === 1 
            ? ["React.js", "JavaScript", "HTML", "CSS"] 
            : i % 2 === 0 
            ? ["Python", "SQL", "Pandas", "Scikit-Learn"] 
            : ["Java", "OOP", "Algorithms", "Git"],
          careerGoal: i === 1 
            ? "Become a Senior Full-Stack Engineer" 
            : i % 2 === 0 
            ? "Become a Data Scientist" 
            : "Become an Android Application Developer",
          studyTime: i === 1 ? 865 : i * 35, // student 1 has 14h 25m = 865 mins
          createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000), // created 7 days ago
        },
      });
    }
    students.push(stud);
  }

  // 2. Seed Achievements
  console.log("Checking Achievements...");
  const achievements = [
    { title: "First Login", description: "Successfully accessed the EduPilot AI deck for the first time.", icon: "🔑" },
    { title: "Course Explorer", description: "Enrolled in your first course and reviewed the syllabus index.", icon: "🗺️" },
    { title: "React Beginner", description: "Completed the first 5 lessons of the React.js Masterclass.", icon: "⚛️" },
    { title: "7 Day Streak", description: "Logged study minutes for 7 consecutive days.", icon: "🔥" },
    { title: "Quiz Master", description: "Scored 100% on any practice AI Quiz.", icon: "🎯" },
    { title: "Prompt Engineer", description: "Completed the prompt engineering curriculum module.", icon: "✍️" },
    { title: "AI Explorer", description: "Used AI chat, roadmap, and doubt solvers at least 10 times.", icon: "🤖" },
    { title: "Top Learner", description: "Logged over 10 hours of active dashboard study time.", icon: "👑" },
  ];
  for (const ach of achievements) {
    const existing = await prisma.achievement.findUnique({ where: { title: ach.title } });
    if (!existing) {
      await prisma.achievement.create({ data: ach });
    }
  }

  // 3. Seed Categories
  console.log("Checking Categories...");
  const categoryData = [
    { name: "Web Development", slug: "web-development", description: "Build modern web platforms and serverless databases." },
    { name: "Programming", slug: "programming", description: "Master software engineering fundamentals and algorithms." },
    { name: "Artificial Intelligence", slug: "artificial-intelligence", description: "Learn neural networks, prompt engineering, and LLMs." },
    { name: "Data Science", slug: "data-science", description: "Manipulate large datasets, visualize stats, and build pipelines." },
    { name: "Career Preparation", slug: "career-preparation", description: "Interview guidelines, portfolios, and logical reasoning puzzles." },
    { name: "Cloud Computing", slug: "cloud-computing", description: "Master AWS, Google Cloud, Docker, and Kubernetes deployment pipelines." },
    { name: "Mobile Apps", slug: "mobile-apps", description: "Build native and cross-platform mobile apps using Flutter and React Native." },
    { name: "Cybersecurity", slug: "cybersecurity", description: "Learn network security, ethical hacking, and penetration testing techniques." },
    { name: "DevOps", slug: "devops", description: "Implement continuous integration, infrastructure as code, and site reliability." },
    { name: "Product Management", slug: "product-management", description: "Learn product strategy, agile methods, roadmap design, and user metrics." }
  ];

  const seededCategories: Record<string, any> = {};
  for (const cat of categoryData) {
    let existing = await prisma.category.findUnique({ where: { slug: cat.slug } });
    if (!existing) {
      existing = await prisma.category.create({ data: cat });
    }
    seededCategories[cat.slug] = existing;
  }

  // 4. Seed Courses, Lessons & Quiz Questions (10 Courses, 250 Lessons, 100 Quiz Questions)
  console.log("Checking Courses & Lessons...");
  const seededCourses: Record<string, string> = {};
  const courseBlueprints = [
    {
      title: "React.js Masterclass",
      subtitle: "Master state, hooks, context, routing, and caps.",
      instructor: "Sarah Johnson",
      duration: "20 Hours",
      level: "Intermediate",
      rating: 4.8,
      enrolledCount: 1250,
      price: 49.99,
      tags: ["React", "Frontend", "JavaScript"],
      category: seededCategories["web-development"],
      thumbnail: "https://images.unsplash.com/photo-1633356122544-f134324a6cee?q=80&w=600",
      description: "A comprehensive guide to React.js, covering functional components, state hooks, context management, and routing.",
      lessonTopics: [
        "Introduction to React", "Environment Setup & Create React App", "JSX Syntax & Elements",
        "Functional Components", "Understanding Props", "Component State Management",
        "The useState Hook", "The useEffect Hook", "Context API & useContext",
        "Mini Project: Todo Board", "Handling Forms & Validation", "Conditional Rendering",
        "List Rendering & Key Attributes", "Styling with Tailwind in React", "Component Lifecycle Events",
        "React Router Basics", "Dynamic Route Parameters", "Working with Axios for API Calls",
        "State Management with Redux Toolkit", "Custom React Hooks", "Performance Optimization & memo",
        "Error Boundaries", "Testing with Jest & React Testing Library", "Deploying React Applications",
        "Capstone React Project"
      ]
    },
    {
      title: "Next.js Full Stack Development",
      subtitle: "Build serverless fullstack apps using app router.",
      instructor: "David Miller",
      duration: "30 Hours",
      level: "Advanced",
      rating: 4.9,
      enrolledCount: 940,
      price: 79.99,
      tags: ["Next.js", "Serverless", "Fullstack"],
      category: seededCategories["web-development"],
      thumbnail: "https://images.unsplash.com/photo-1517694712202-14dd9538aa97?q=80&w=600",
      description: "Master full-stack serverless architectures in Next.js 15 app router, database pooling, and API route handlers.",
      lessonTopics: [
        "Next.js Overview", "App Router folder paradigm", "File-based Routing",
        "Dynamic Path Parameters", "Catch-all Routing brackets", "Link and Navigation",
        "Server Components by default", "Client Components & use client directive", "Dynamic fetch data calls",
        "Static Site Generation", "Server Side Rendering", "Incremental Static Regeneration",
        "Next.js Route Handlers", "Request & Response objects", "Routing Middlewares",
        "SEO Optimization & Metadata", "Customizing layouts & documents", "CSS modules vs Tailwind",
        "Image component optimization", "Font loading systems", "Introduction to Server Actions",
        "Form states & action statuses", "Authentication with NextAuth", "Credentials provider setup",
        "JWT session handling", "Connecting Prisma ORM", "Neon PostgreSQL pooling",
        "Database Migrations", "Deploying to Vercel", "Caching & Cache Purges",
        "Internationalized layouts", "Error Handling pages", "Custom Middleware guards",
        "App Analytics & Vitals", "Capstone Next.js SaaS build"
      ]
    },
    {
      title: "Java Programming Bootcamp",
      subtitle: "Zero to job ready java coding bootcamp.",
      instructor: "Michael Lee",
      duration: "28 Hours",
      level: "Intermediate",
      rating: 4.7,
      enrolledCount: 780,
      price: 59.99,
      tags: ["Java", "OOP", "Backend"],
      category: seededCategories["programming"],
      thumbnail: "https://images.unsplash.com/photo-1515879218367-8466d910aaa4?q=80&w=600",
      description: "Complete Java syntax roadmap covering OOP principles, exception handling, data structures, and Spring Boot basics.",
      lessonTopics: [
        "Introduction to Java", "Understanding JVM, JDK, and JRE", "Variables & Base Types",
        "Logical & Arithmetic Operators", "Conditional If-Else blocks", "Switch Case operations",
        "For Loops & iterations", "While Loops and conditions", "One-dimensional Arrays",
        "Methods & function scopes", "Object Oriented Principles", "Classes and Object Instances",
        "Default & Custom Constructors", "Inheritance & super()", "Polymorphism & overrides",
        "Encapsulation & accessors", "Abstraction & interfaces", "Abstract Classes",
        "Packages & module imports", "Exception Handling try-catch", "Creating Custom Exceptions",
        "ArrayList Collections", "Vectors & Stack collections", "HashMap & key-value indices",
        "File Operations Read-Write", "Multithreading & Thread runnable", "Concurrency basics",
        "Maven Build configuration", "JUnit testing frameworks", "JDBC database connectors",
        "Spring Boot Intro", "Deploying spring boot apps"
      ]
    },
    {
      title: "Data Structures & Algorithms",
      subtitle: "Ace coding interviews with deep algorithm prep.",
      instructor: "Professor Charles",
      duration: "40 Hours",
      level: "Advanced",
      rating: 4.9,
      enrolledCount: 1620,
      price: 89.99,
      tags: ["DSA", "Algorithms", "Interviews"],
      category: seededCategories["programming"],
      thumbnail: "https://images.unsplash.com/photo-1607799279861-4dd421887fb3?q=80&w=600",
      description: "Master time complexities, linear data structures, search algorithms, graphs, and dynamic programming.",
      lessonTopics: [
        "Big O Notation", "Time and Space Complexity Analysis", "Array operations & allocations",
        "Linked List structures", "Singly Linked List implementations", "Doubly Linked List bounds",
        "Stack data structures", "Queue structures", "Circular Queues",
        "Double-ended Queue (Deque)", "Recursion fundamentals", "Binary Tree structures",
        "Binary Search Trees (BST)", "BST Node Insertion", "BST Node Deletion",
        "Tree Traversals (Inorder)", "Tree Traversals (Preorder)", "Tree Traversals (Postorder)",
        "Graph representation matrices", "Graph adjacency lists", "Breadth First Search (BFS)",
        "Depth First Search (DFS)", "Linear Search algorithm", "Binary Search indexes",
        "Bubble Sort", "Selection Sort", "Insertion Sort", "Merge Sort",
        "Quick Sort", "Heap Sort", "Hash Tables", "Collision Resolution strategies",
        "Binary Heap priority queues", "Disjoint Set operations", "Trie Data Structure",
        "Backtracking search", "Greedy Algorithm techniques", "Dynamic Programming paradigms",
        "Knapsack 0-1 Problem", "Fibonacci space optimizations", "Longest Common Subsequence",
        "Shortest Path Dijkstra", "Bellman-Ford algorithms", "Prim's Minimum Spanning Tree",
        "Kruskal's MST algorithm", "Floyd-Warshall all-pairs", "Topological Sort",
        "Red-Black Tree balance"
      ]
    },
    {
      title: "SQL & PostgreSQL",
      subtitle: "Design database structures and optimize slow queries.",
      instructor: "David Miller",
      duration: "15 Hours",
      level: "Beginner",
      rating: 4.6,
      enrolledCount: 1100,
      price: 39.99,
      tags: ["SQL", "PostgreSQL", "Database"],
      category: seededCategories["programming"],
      thumbnail: "https://images.unsplash.com/photo-1544383835-bda2bc66a55d?q=80&w=600",
      description: "Learn relational database concepts, write joins, manage subqueries, and create performant indexes.",
      lessonTopics: [
        "Relational Databases Intro", "SQL Syntax Foundations", "CREATE TABLE definitions",
        "INSERT INTO operations", "SELECT query statements", "Filtering with WHERE",
        "Sorting with ORDER BY", "Aggregate Functions (SUM, AVG)", "Grouping with GROUP BY",
        "HAVING filter clauses", "INNER JOIN relationships", "LEFT JOIN queries",
        "RIGHT JOIN queries", "FULL OUTER JOIN structures", "Writing Subqueries",
        "PostgreSQL specific types", "Primary & Foreign keys", "Database Index definitions",
        "Transactions (BEGIN, COMMIT)", "Database Views & triggers"
      ]
    },
    {
      title: "AI Career Accelerator",
      subtitle: "Build portfolio SaaS and master agentic prompts.",
      instructor: "Professor Charles",
      duration: "12 Hours",
      level: "Intermediate",
      rating: 4.9,
      enrolledCount: 890,
      price: 99.99,
      tags: ["AI", "Generative AI", "LLM"],
      category: seededCategories["artificial-intelligence"],
      thumbnail: "https://images.unsplash.com/photo-1677442136019-21780efad99a?q=80&w=600",
      description: "Build an outstanding AI portfolio, connect LLM endpoints, run vector searches, and deploy smart workflows.",
      lessonTopics: [
        "AI Job Market Overview", "AI Developer vs Engineer roles", "SaaS Portfolio Planning",
        "Generative AI API architectures", "Fine-Tuning vs Prompting", "Vector Databases Intro",
        "Building RAG structures", "Agentic Workflows", "LangChain Framework basics",
        "LlamaIndex connections", "Deploying LLM endpoints", "API Rate Limiting designs",
        "Managing API budgets", "Ethical AI & Bias parameters", "Technical Documentation writing",
        "AI Code Interview structures", "Model Evaluation indexes", "Continuous study frameworks"
      ]
    },
    {
      title: "Prompt Engineering",
      subtitle: "Craft strategic prompt systems for model outputs.",
      instructor: "Sarah Johnson",
      duration: "10 Hours",
      level: "Beginner",
      rating: 4.8,
      enrolledCount: 1450,
      price: 29.99,
      tags: ["AI", "Prompts", "Gemini"],
      category: seededCategories["artificial-intelligence"],
      thumbnail: "https://images.unsplash.com/photo-1620712943543-bcc4688e7485?q=80&w=600",
      description: "Formulate prompt strategies: zero-shot learning, few-shot prompting, and chain of thought models.",
      lessonTopics: [
        "Introduction to Prompts", "Zero-Shot Learning structures", "Few-Shot Prompt structures",
        "Chain of Thought prompts", "ReAct framework prompts", "System instruction rules",
        "Prompt Injection security risks", "Formatting output as JSON", "Model parameters (Temperature)",
        "Prompt structure techniques", "Automated Prompt generation", "Prompt Evaluation models",
        "Summarization Prompt blocks", "Code Generator Prompts", "Next-gen prompting trends"
      ]
    },
    {
      title: "Machine Learning Fundamentals",
      subtitle: "Build statistical models using scikit-learn.",
      instructor: "Michael Lee",
      duration: "18 Hours",
      level: "Intermediate",
      rating: 4.7,
      enrolledCount: 520,
      price: 69.99,
      tags: ["ML", "Data Science", "Python"],
      category: seededCategories["data-science"],
      thumbnail: "https://images.unsplash.com/photo-1527474305487-b87b222841cc?q=80&w=600",
      description: "Supervised and unsupervised regression, classification, random forests, and validation metrics.",
      lessonTopics: [
        "Machine Learning Landscape", "Supervised vs Unsupervised", "Linear Regression equations",
        "Logistic Regression functions", "Evaluating cost functions", "Gradient Descent operations",
        "Overfitting & Underfitting balance", "Regularization (Lasso & Ridge)", "Decision Trees",
        "Random Forest algorithms", "Support Vector Machines", "K-Nearest Neighbors",
        "K-Means Clustering", "Principal Component Analysis", "Bias-Variance Tradeoff",
        "K-Fold Cross Validation", "Precision, Recall, and F1 index", "ROC & AUC curves",
        "Feature Engineering pipelines", "Neural Networks intro", "Deep Learning basics",
        "ML Ops pipelines"
      ]
    },
    {
      title: "Interview Preparation",
      subtitle: "Prepare behavioral responses and whiteboards.",
      instructor: "Sarah Johnson",
      duration: "8 Hours",
      level: "Intermediate",
      rating: 4.9,
      enrolledCount: 2010,
      price: 19.99,
      tags: ["Career", "Interviews", "Soft Skills"],
      category: seededCategories["career-preparation"],
      thumbnail: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?q=80&w=600",
      description: "Syllabus review covering dynamic programming reviews, design templates, behavioral answers, and whiteboarding.",
      lessonTopics: [
        "Resume building guidelines", "Coding interview patterns", "System Design structure",
        "Behavioral questions STAR method", "Explaining Space-Time Bounds", "Whiteboard presentation skills",
        "Salary negotiations", "Mock interview exercises", "Dynamic Programming review",
        "Query Optimization reviews", "Next.js routing layouts review", "Follow-up email templates"
      ]
    },
    {
      title: "Aptitude & Logical Reasoning",
      subtitle: "Conquer analytical puzzles and logic tests.",
      instructor: "Michael Lee",
      duration: "12 Hours",
      level: "Beginner",
      rating: 4.5,
      enrolledCount: 640,
      price: 24.99,
      tags: ["Math", "Aptitude", "Logic"],
      category: seededCategories["career-preparation"],
      thumbnail: "https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?q=80&w=600",
      description: "Conquer Logical Deductions, Number series, Puzzles, Venn diagrams, and workspace arithmetic.",
      lessonTopics: [
        "Number Series sequences", "Percentages calculations", "Profit & Loss equations",
        "Interest calculations (Simple/Compound)", "Time & Work equations", "Speed & Distance checks",
        "Ratios & Proportions", "Permutations and Combinations", "Probability indices",
        "Coding-Decoding puzzles", "Blood relations charts", "Syllogism logs",
        "Data Interpretation charts", "Venn Diagram categories", "Seating arrangements puzzles",
        "Logical Deductions"
      ]
    }
  ];

  for (const blueprint of courseBlueprints) {
    if (!blueprint.category?.id) continue;
    
    let course = await prisma.course.findFirst({ where: { title: blueprint.title } });
    if (!course) {
      console.log(`Seeding Course: ${blueprint.title}...`);
      course = await prisma.course.create({
        data: {
          title: blueprint.title,
          subtitle: blueprint.subtitle,
          instructor: blueprint.instructor,
          duration: blueprint.duration,
          level: blueprint.level,
          rating: blueprint.rating,
          enrolledCount: blueprint.enrolledCount,
          price: blueprint.price,
          tags: blueprint.tags,
          categoryId: blueprint.category.id,
          thumbnail: blueprint.thumbnail,
          description: blueprint.description || `Master the principles of ${blueprint.title} with Sarah, Michael, or Professor Charles.`,
          status: "PUBLISHED",
        },
      });

      // Seed lessons (exactly 25 per course)
      for (let o = 0; o < 25; o++) {
        const topic = blueprint.lessonTopics[o] || `${blueprint.title} Module ${o + 1}`;
        const order = o + 1;
        
        const content = `### Study Material: ${topic}
        
Welcome to unit ${order}. This educational notebook covers core definitions and implementation patterns.

* **Concept**: ${topic} forms the backbone of modern architectures in this discipline.
* **Practice**: Always test modules locally and inspect connections for leaks.
* **Exercise**: Build a simple component integrating this feature.`;

        const lesson = await prisma.lesson.create({
          data: {
            title: topic,
            description: `Core parameters and deployment methods for ${topic}.`,
            content,
            duration: `${10 + (order % 3) * 5} mins`,
            youtubeUrl: "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
            pdfUrl: "https://res.cloudinary.com/demo/image/upload/sample_notes.pdf",
            courseId: course.id,
            order,
          },
        });

        // Seed QuizQuestions (10 per Course linked to first 10 lessons)
        if (order <= 10) {
          await prisma.quizQuestion.create({
            data: {
              courseId: course.id,
              lessonId: lesson.id,
              question: `What is the primary function of ${topic}?`,
              options: ["Optimize code efficiency", "Enforce boundary rules", "Speed up retrieval", "All of the above"],
              answer: "All of the above",
              explanation: `${topic} manages structural layouts, improves runtimes, and guarantees safety.`,
              difficulty: order % 3 === 0 ? "Hard" : order % 3 === 1 ? "Easy" : "Medium",
              marks: 5,
              timeLimit: 10,
            }
          });
        }
      }

      // Course Assignments
      await prisma.assignment.create({
        data: {
          title: `${blueprint.title} Capstone Project`,
          description: `Submit a functional workspace application implementing the criteria outlined in ${blueprint.title}.`,
          deadline: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000), // 14 days out
          fileUrl: "https://res.cloudinary.com/demo/image/upload/sample_notes.pdf",
          courseId: course.id,
        }
      });
    }
    seededCourses[blueprint.title] = course.id;
  }

  // 5. Seed student progress records if progress table is empty
  const progressCount = await prisma.progress.count();
  if (progressCount === 0 && students.length > 0) {
    const student1 = students.find(s => s.email === "student1@edupilot.ai");
    if (student1) {
      console.log(`Seeding progress records for primary student: ${student1.email}`);
      const reactLessons = await prisma.lesson.findMany({ where: { courseId: seededCourses["React.js Masterclass"] }, orderBy: { order: "asc" } });
      const aiLessons = await prisma.lesson.findMany({ where: { courseId: seededCourses["AI Career Accelerator"] }, orderBy: { order: "asc" } });
      const prepLessons = await prisma.lesson.findMany({ where: { courseId: seededCourses["Interview Preparation"] }, orderBy: { order: "asc" } });

      // React completions (10)
      for (let i = 0; i < 10; i++) {
        if (reactLessons[i]) await prisma.progress.create({ data: { userId: student1.id, lessonId: reactLessons[i].id, completed: true } });
      }
      // AI Career completions (5)
      for (let i = 0; i < 5; i++) {
        if (aiLessons[i]) await prisma.progress.create({ data: { userId: student1.id, lessonId: aiLessons[i].id, completed: true } });
      }
      // Interview Prep completions (3)
      for (let i = 0; i < 3; i++) {
        if (prepLessons[i]) await prisma.progress.create({ data: { userId: student1.id, lessonId: prepLessons[i].id, completed: true } });
      }

      // Seed 12 bookmarks
      const bookmarksList = [
        reactLessons[4]?.id, // React Lesson 5
        aiLessons[1]?.id,    // AI Career Lesson 2
        prepLessons[0]?.id,  // Prep Lesson 1
        reactLessons[7]?.id,
        reactLessons[10]?.id,
        aiLessons[3]?.id,
        prepLessons[2]?.id,
      ].filter(Boolean);

      for (const lessonId of bookmarksList) {
        await prisma.bookmark.create({ data: { userId: student1.id, lessonId } });
      }

      // Seed 1 mock Certificate for React
      const reactCourseId = seededCourses["React.js Masterclass"];
      await prisma.certificate.create({
        data: {
          userId: student1.id,
          courseId: reactCourseId,
          certificateId: `EP-${reactCourseId.substring(0,4)}-${student1.id.substring(0,4)}`.toUpperCase(),
        }
      });

      // Seed 1 mock Assignment submission
      const assignments = await prisma.assignment.findMany({ where: { courseId: reactCourseId } });
      if (assignments.length > 0) {
        await prisma.assignmentSubmission.create({
          data: {
            userId: student1.id,
            assignmentId: assignments[0].id,
            fileUrl: "https://res.cloudinary.com/demo/image/upload/sample_notes.pdf",
            marks: 92,
            feedback: "Great implementation of state variables and hooks structure! Review prop drilling parameters.",
            status: "GRADED",
          }
        });
      }
    }
  }

  console.log("Database seeding completed successfully!");
}

main()
  .catch((e) => {
    console.error("Error during seeding execution:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
