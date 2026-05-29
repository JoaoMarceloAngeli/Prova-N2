export interface User {
  id: string;
  name: string;
  email: string;
  password: string;
  role: "admin" | "student";
  createdAt: string;
}

export interface Module {
  id: string;
  title: string;
  description: string;
  course: string;
  order: number;
  lessonCount: number;
  createdAt: string;
}

export interface Trail {
  id: string;
  title: string;
  description: string;
  category: string;
  createdAt: string;
}

export interface TrailCourse {
  id: string;
  trailId: string;
  courseId: string;
  order: number;
}

export interface Course {
  id: string;
  title: string;
  description: string;
  createdAt: string;
}

export interface Plan {
  id: string;
  name: string;
  type: "mensal" | "anual" | "vitalício";
  price: number;
  features: string[];
  createdAt: string;
}

export interface Subscription {
  id: string;
  userId: string;
  planId: string;
  startDate: string;
  status: "active" | "cancelled";
}
