interface Course {
  name: string;
  price: string;
  diets: string;
}

interface Menu {
  _id: string;
  courses: Course[];
}
export type {Menu};
