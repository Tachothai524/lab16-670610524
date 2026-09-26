import { create } from "zustand";
import { persist } from "zustand/middleware";
import {
  students as initialStudents,
  courses as initialCourses,
  // enrollments as initialEnrollments,
} from "@/lib/mock-data";
import type { Course, Student } from "@/lib/types";

type EnrollmentStore = {
  students: Student[];
  courses: Course[];
  // enrollments: Enrollment[];

  /** เพิ่มวิชาใหม่ */
  addCourse: (course: Course) => void;
  // /** Admin ลงทะเบียนวิชาให้นักศึกษาคนใดก็ได้ (ไม่ซ้ำกับที่มีอยู่แล้ว) */
  // enroll: (studentId: string, courseId: string) => void;
  // /** Admin ยกเลิกการลงทะเบียนของนักศึกษาคนใดก็ได้ */
  // drop: (studentId: string, courseId: string) => void;
  /** ลงทะเบียนเรียนให้นักศึกษา */
  enrollCourse: (studentId: string, courseCode: string) => void;
  /** ลบนักศึกษา พร้อมการลงทะเบียนทั้งหมดของคนนั้น */
  removeStudent: (studentId: string) => void;
  /** ลบวิชาออกจากรายวิชาที่เปิดสอน พร้อม cascade ลบ enrollment ที่อ้างถึงวิชานั้นทั้งหมด */
  removeCourse: (courseId: string) => void;
  /** ยกเลิกรายวิชาของนักศึกษา */
  dropCourse: (studentId: string, courseCode: string) => void;
  /** ลบชื่อผู้สอนออกจากรายวิชาที่กำหนด */
  removeInstructor: (courseCode: string, instructorName: string) => void;
};

export const useEnrollmentStore = create<EnrollmentStore>()(

persist(
    (set) => ({
      students: initialStudents,
      courses: initialCourses,

      addCourse: (newCourse) =>
        set((state) => ({
          courses: [...state.courses, newCourse],
        })),

      removeCourse: (courseCode) =>
        set((state) => ({
          courses: state.courses.filter((c) => c.courseCode !== courseCode),
          students: state.students.map((student) => ({
            ...student,
            enrolledCourses: student.enrolledCourses.filter(
              (code) => code !== courseCode
            ),
          })),
        })),

      enrollCourse: (studentId, courseCode) =>
        set((state) => ({
          students: state.students.map((student) => {
            if (student.studentId === studentId) {
              if (!student.enrolledCourses.includes(courseCode)) {
                return {
                  ...student,
                  enrolledCourses: [...student.enrolledCourses, courseCode],
                };
              }
            }
            return student;
          }),
        })),

      dropCourse: (studentId, courseCode) =>
        set((state) => ({
          students: state.students.map((student) => {
            if (student.studentId === studentId) {
              return {
                ...student,
                enrolledCourses: student.enrolledCourses.filter(
                  (code) => code !== courseCode
                ),
              };
            }
            return student;
          }),
        })),

      removeStudent: (studentId) =>
        set((state) => ({
          students: state.students.filter((s) => s.studentId !== studentId),
        })),
      
      removeInstructor: (courseCode, instructorName) =>
        set((state) => ({
          courses: state.courses.map((course) => {
          if (course.courseCode === courseCode) {
          return {
            ...course,
            instructors: course.instructors?.filter((t) => t !== instructorName),
          };
        }
        return course;
        }),
      })),
    }),
    {
      name: "lab16-2569-670610524",
      partialize: (state) => ({
        students: state.students,
        courses: state.courses,
      })
    }
  )
);
