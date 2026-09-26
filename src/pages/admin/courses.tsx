import { useState } from "react";
import { PlusCircle , X , Trash } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Combobox,
  ComboboxChip,
  ComboboxChips,
  ComboboxChipsInput,
  ComboboxContent,
  // ComboboxEmpty,
  ComboboxItem,
  ComboboxList,
  ComboboxValue,
  useComboboxAnchor,
} from "@/components/ui/combobox"
import { useEnrollmentStore } from "@/lib/enrollment-store";
import type { Course } from "@/lib/types";

export default function AdminCousesPage() {
    const { courses, removeInstructor, removeCourse ,addCourse} = useEnrollmentStore();
    
      const [Codecourse, setCodecourse] = useState<string>("");
      const [Namecourse, setNamecourse] = useState<string>("");
      // const [Teacher, setTeacher] = useState<string>("");
      const [selectedTeachers, setSelectedTeachers] = useState<string[]>([]);
      const [enrollDialogOpen, setEnrollDialogOpen] = useState(false);
      const [courseToDelete, setCourseToDelete] = useState<Course | null>(null);
      const [searchQuery, setSearchQuery] = useState("");
      const anchorRef = useComboboxAnchor();

      // ดึงรายชื่อผู้สอนทั้งหมดจากทุกวิชามาแบบไม่ซ้ำกัน
      const allInstructors = Array.from(
        new Set(courses.flatMap((c) => c.instructors || []))
      );

      // const [mode, setMode] = useState<"course" | "student">("course");
      // const [filterCourse, setFilterCourse] = useState("all");
      // const [filterStudent, setFilterStudent] = useState("all");
    
      // const studentOptions: Option[] = students.map((s) => ({
      //   value: s.studentId,
      //   label: `${s.studentId} — ${s.firstName} ${s.lastName}`,
      // }));
      // const courseOptions: Option[] = courses.map((c) => ({
      //   value: c.courseCode,
      //   label: `${c.courseCode} — ${c.courseTitle}`,
      // }));
    
      // วิชาที่นักศึกษาที่เลือกยังไม่ได้ลงทะเบียน
      // const availableCourseOptions = courseOptions.filter(
      //   (c) =>
      //     !enrollments.some(
      //       (e) => e.studentId === formStudent && e.courseId === c.value
      //     )
      // );

      const confirmDeleteCourse = () => {
      if (courseToDelete) {
        removeCourse(courseToDelete.courseCode);
        setCourseToDelete(null);
        }
      };

      // เช็คว่ามีรหัสวิชานี้อยู่แล้วในระบบหรือไม่ (เทียบแบบ Case-insensitive เพื่อความแม่นยำ)
      const isDuplicateCode = courses.some(
        (c) =>
          c.courseCode.trim().toLowerCase() === Codecourse.trim().toLowerCase(),
      );

      // เช็คว่าข้อความที่พิมพ์ตรงกับผู้สอนที่มีอยู่แล้วหรือไม่ (Case-insensitive)
      const trimmedInput = searchQuery.trim();
      const isInstructorExists = allInstructors.some(
        (teacher) => teacher.toLowerCase() === trimmedInput.toLowerCase(),
      );

      // กรองรายชื่อผู้สอนให้ตรงกับคำที่พิมพ์ (ไม่สนตัวพิมพ์เล็ก-ใหญ่)
      const filteredInstructors = allInstructors.filter((teacher) =>
        teacher.toLowerCase().includes(searchQuery.trim().toLowerCase()),
      );
    
      const handleEnroll = () => {
        if (!Codecourse || !Namecourse || isDuplicateCode) return;
        // enroll(formStudent, formCourse);
        addCourse({
          courseCode: Codecourse,
          courseTitle: Namecourse,
          instructors: selectedTeachers,
        });
        setCodecourse("");
        setNamecourse("");
        setSearchQuery("");
        setSelectedTeachers([]);
        setEnrollDialogOpen(false);
      };
    
      // เคลียร์ฟอร์มทุกครั้งที่ Dialog ปิด ไม่ว่าจะปิดเพราะลงทะเบียนสำเร็จ, กด X,
      // หรือคลิกนอก Dialog — เปิดครั้งหน้าจะได้เริ่มจากฟอร์มว่างเสมอ
      const handleEnrollDialogOpenChange = (open: boolean) => {
        setEnrollDialogOpen(open);
        if (!open) {
          setCodecourse("");
          setNamecourse("");
          setSearchQuery("");
          setSelectedTeachers([]);
        }
      };
    
      // const rows = enrollments.filter((e) =>
      //   mode === "course"
      //     ? filterCourse === "all" || e.courseId === filterCourse
      //     : filterStudent === "all" || e.studentId === filterStudent
      // );
    
      // const nameOf = (studentId: string) => {
      //   const s = students.find((x) => x.studentId === studentId);
      //   return s ? `${s.firstName} ${s.lastName}` : "-";
      // };
      // const titleOf = (courseId: string) =>
      //   courses.find((c) => c.courseCode === courseId)?.courseTitle ?? "-";

      const numberOf = (courseCode: string) => {
        const s = courses.find((x) => x.courseCode === courseCode)?.instructors
        return s ? s.length : 0;
      };

    return (
        <div className="space-y-4">
          <div className="flex items-start justify-between">
            <div>
            <h1 className="text-xl font-semibold">จัดการการวิชาเรียน</h1>
            <p className="text-sm text-muted-foreground">
              {` ${courses.length} วิชา — เพิ่มวิชาใหม่ที่นี่แล้วจะไปโผล่เป็นตัวเลือก ตอนลงทะเบียนให้นักศึกษาที่หน้า "จัดการการลงทะเบียน" ทันที `}
            </p>
          </div>

          <Dialog open={enrollDialogOpen} onOpenChange={handleEnrollDialogOpenChange}>
            <DialogTrigger render={<Button />}>
              <PlusCircle className="h-4 w-4" />
              เพิ่มวิชา
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>เพิ่มวิชาใหม่</DialogTitle>
                <DialogDescription>
                  วิชาที่เพิ่มจะไปโผล่เป็นตัวเลือกตอนลงทะเบียนให้นักศึกษาได้ทันที
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-4">
                <div className="grid gap-1.5">
                  <Label htmlFor="formStudent">รหัสวิชา</Label>
                  {/* <OptionSelect
                    id="formStudent"
                    options={studentOptions}
                    value={formStudent}
                    placeholder="เลือกนักศึกษา"
                    onChange={(v) => {
                      setFormStudent(v);
                      setFormCourse(null);
                    }}
                  /> */}
                  <Input id="course" 
                  className={
                    isDuplicateCode && Codecourse
                      ? "border-red-500 ring-red-200 focus-visible:ring-red-200 border-red-500"
                      : ""
                  }
                  value={Codecourse} 
                  onChange={(e) => setCodecourse(e.target.value)} 
                  placeholder="เช่น 261207"/>

                  {isDuplicateCode && Codecourse && (
                  <span className="text-xs text-red-500">
                    มีรหัสวิชา {Codecourse} นี้แล้ว
                  </span>
                )}
                </div>
                <div className="grid gap-1.5">
                  <Label htmlFor="formCourse">ชื่อวิชา</Label>
                  {/* <OptionSelect
                    id="formCourse"
                    options={availableCourseOptions}
                    value={formCourse}
                    placeholder={
                      formStudent && availableCourseOptions.length === 0
                        ? "ลงทะเบียนครบทุกวิชาแล้ว"
                        : "เลือกวิชา"
                    }
                    onChange={setFormCourse}
                  /> */}
                  <Input id="course" value={Namecourse} onChange={(e) => setNamecourse(e.target.value)} placeholder="เช่น Basic Computer Engineering Lab"/>
                </div>

                <div className="grid gap-1.5">
                  <Label htmlFor="formCourse">ผู้สอน</Label>
                  {/* <OptionSelect
                    id="formCourse"
                    options={availableCourseOptions}
                    value={formCourse}
                    placeholder={
                      formStudent && availableCourseOptions.length === 0
                        ? "ลงทะเบียนครบทุกวิชาแล้ว"
                        : "เลือกวิชา"
                    }
                    onChange={setFormCourse}
                  /> */}
                  {/* <Input id="course" value={Teacher} onChange={(e) => setTeacher(e.target.value)} placeholder="เลือกหรือพิมพ์ชื่อผู้สอน (ได้หลายคน)"/> */}
                  <Combobox
                  multiple
                  value={selectedTeachers}
                  onValueChange={(values) => {
                    setSearchQuery("")
                    setSelectedTeachers(values as string[])}}
                >
                  <ComboboxChips ref={anchorRef} className="w-full">
                    <ComboboxValue>
                      {(values: string[]) =>
                        values.map((teacher) => (
                          <ComboboxChip key={teacher}>
                            {teacher}
                          </ComboboxChip>
                        ))
                      }
                    </ComboboxValue>
                    <ComboboxChipsInput placeholder={
                      selectedTeachers.length > 0? "" : "เลือกหรือพิมพ์ชื่อผู้สอน (ได้หลายคน)"
                    } 
                    onChange={(e) => setSearchQuery(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" && searchQuery.trim()) {
                        e.preventDefault();
                        const trimmed = searchQuery.trim();
                        
                        // ค้นหาว่ามีชื่อที่ตรงกับที่พิมพ์ไหม (เทียบตัวพิมพ์เล็ก-ใหญ่)
                        const matchedTeacher = allInstructors.find(
                          (t) => t.toLowerCase() === trimmed.toLowerCase()
                        );

                        // ถ้ารายการที่กรองอยู่มีผลลัพธ์ ให้เอาตัวแรก หรือถ้ามีชื่อตรงกัน ให้เอาชื่อนั้น
                        const targetValue = matchedTeacher || filteredInstructors[0] || trimmed;

                        // ถ้ายังไม่มีใน SelectedInstructor ให้เพิ่มเข้าไป
                        if (!selectedTeachers.includes(targetValue)) {
                          setSelectedTeachers([...selectedTeachers, targetValue]);
                        }

                        // เคลียร์ช่องพิมพ์
                        setSearchQuery("");
                      }
                    }}
                    />
                  </ComboboxChips>
                  <ComboboxContent anchor={anchorRef}>
                    <ComboboxList>
                      {filteredInstructors.map((instructor) => (
                        <ComboboxItem key={instructor} value={instructor}>
                          {instructor}
                        </ComboboxItem>
                      ))}

                      {/* แสดงปุ่มเพิ่มผู้สอนใหม่เมื่อพิมพ์ข้อความและยังไม่มีในรายชื่อ */}
                      {trimmedInput && !isInstructorExists && (
                        <ComboboxItem
                          value={trimmedInput}
                        >
                          + เพิ่มผู้สอน "{trimmedInput}"
                        </ComboboxItem>
                      )}
                    </ComboboxList>
                  </ComboboxContent>
                </Combobox>
                </div>
              </div>
              <DialogFooter>
                <Button disabled={!Codecourse || !Namecourse || isDuplicateCode} onClick={handleEnroll}>
                  <PlusCircle className="h-4 w-4" />
                  บันทึก
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
          </div>
    
          <div className="rounded-lg border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>รหัสวิชา</TableHead>
                  <TableHead>ขื่อวิชา</TableHead>
                  <TableHead>ชื่อผู้สอน</TableHead>
                  <TableHead>Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {courses.length === 0 && (
                  <TableRow>
                    <TableCell
                      colSpan={4}
                      className="h-20 text-center text-muted-foreground"
                    >
                      ยังไม่มีวิชาที่เปิดสอน
                    </TableCell>
                  </TableRow>
                )}
                {courses.map((e) => (
                  <TableRow key={`${e.courseCode}-${e.courseTitle}`}>
                    <TableCell className="my-3">{e.courseCode}</TableCell>
                    <TableCell className="my-3">{e.courseTitle}</TableCell>
                    <TableCell className="flex items-center gap-2 my-3">
                      {numberOf(e.courseCode) === 0? 
                      <span className="text-muted-foreground">
                        ยังไม่มีผู้สอน
                      </span>
                      :
                        <div className="flex flex-wrap gap-1.5">
                            {e.instructors?.map((instructor) => (
                            <Badge className="inline-flex items-center gap-1 px-2 py-1 bg-blue-50 border border-blue-200 rounded-full text-blue-600 text-sm dark:bg-blue-950 dark:border-blue-800 dark:text-blue-300">
                                {instructor}
                                <Button className="hover:text-blue-800 focus:outline-none flex items-center justify-center w-4 h-4 hover:text-red-600" 
                                variant="ghost"
                                onClick={() => removeInstructor(e.courseCode,instructor)}>
                                    <X />
                                </Button>
                            </Badge>
                            ))
                            }
                        </div>
                      }
                    </TableCell>
                    <TableCell className="p-4">
                        <Button className=" flex items-center justify-center w-4 h-4 text-red-600 hover:text-red-600 dark:hover:bg-muted/50 size-7" 
                        variant="ghost"
                        onClick={() => setCourseToDelete(e)}
                        >
                            <Trash />
                        </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          {/* Dialog ยืนยันการลบวิชา */}
          <Dialog open={!!courseToDelete} onOpenChange={(open) => !open && setCourseToDelete(null)}>
            <DialogContent className="sm:max-w-[400px]">
              <DialogHeader>
                <DialogTitle>ลบวิชา?</DialogTitle>
                <DialogDescription>
                  ลบ {courseToDelete?.courseCode} — {courseToDelete?.courseTitle} ออกจากรายวิชาที่เปิดสอน
                </DialogDescription>
              </DialogHeader>
              <DialogFooter className="mt-2 flex gap-2 sm:justify-end">
                <Button
                  variant="outline"
                  onClick={() => setCourseToDelete(null)}
                >
                  ยกเลิก
                </Button>
                <Button
                  variant="destructive"
                  className="bg-red-100 text-red-600 hover:bg-red-200 shadow-none"
                  onClick={confirmDeleteCourse}
                >
                  ยืนยัน
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
    );
}