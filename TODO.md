# Task TODO

- [x] Move RTU_Logo.jpg from admin-dashboard root into admin-dashboard/public/ as public/rtu_logo.png
- [x] In every src file that uses GraduationCap from lucide-react:
  - [x] Replace <GraduationCap ... /> usage with `<img src="/rtu_logo.png" alt="RTU Logo" style={{ width: '36px', height: '36px', borderRadius: '50%' }} />`
  - [x] Remove GraduationCap from the lucide-react imports where no longer used
- [x] Re-run search to confirm no remaining GraduationCap usages/imports in src

