import jsPDF from "jspdf";

export const generateCertificatePDF = (
  userName,
  courseName,
  completionDate
) => {
  console.log("🎨 PDF Generator received:", {
    userName,
    courseName,
    courseNameLength: courseName?.length,
    courseNameType: typeof courseName,
    completionDate,
    completionDateType: typeof completionDate,
  });

  // Validate and sanitize inputs - create new variables to ensure proper assignment
  let validUserName = userName;
  let validCourseName = courseName;
  let validCompletionDate = completionDate;

  if (!validUserName || validUserName.trim() === "") {
    console.error("ERROR: userName is required for certificate generation");
    validUserName = "Student Name";
  }
  if (!validCourseName || validCourseName.trim() === "") {
    console.error("ERROR: courseName is required for certificate generation");
    validCourseName = "Course Name";
  }
  if (
    !validCompletionDate ||
    !(validCompletionDate instanceof Date) ||
    isNaN(validCompletionDate)
  ) {
    console.error(
      "ERROR: valid completionDate is required for certificate generation"
    );
    validCompletionDate = new Date();
  }

  console.log("✅ Validated values:", {
    validUserName,
    validCourseName,
    validCompletionDate: validCompletionDate.toISOString(),
  });

  const pdf = new jsPDF({
    orientation: "landscape",
    unit: "mm",
    format: "a4",
  });

  const pageWidth = pdf.internal.pageSize.getWidth();
  const pageHeight = pdf.internal.pageSize.getHeight();

  // White background
  pdf.setFillColor(255, 255, 255);
  pdf.rect(0, 0, pageWidth, pageHeight, "F");

  // Outer border - elegant double frame with better spacing
  pdf.setDrawColor(41, 128, 185); // Professional blue
  pdf.setLineWidth(2);
  pdf.rect(10, 10, pageWidth - 20, pageHeight - 20);

  pdf.setLineWidth(0.5);
  pdf.rect(15, 15, pageWidth - 30, pageHeight - 30);

  // Decorative corner accents - smaller and cleaner
  pdf.setFillColor(41, 128, 185);
  const cornerSize = 12;

  // Top corners
  pdf.rect(18, 18, cornerSize, 1.5, "F");
  pdf.rect(18, 18, 1.5, cornerSize, "F");
  pdf.rect(pageWidth - 18 - cornerSize, 18, cornerSize, 1.5, "F");
  pdf.rect(pageWidth - 19.5, 18, 1.5, cornerSize, "F");

  // Bottom corners
  pdf.rect(18, pageHeight - 19.5, cornerSize, 1.5, "F");
  pdf.rect(18, pageHeight - 18 - cornerSize, 1.5, cornerSize, "F");
  pdf.rect(
    pageWidth - 18 - cornerSize,
    pageHeight - 19.5,
    cornerSize,
    1.5,
    "F"
  );
  pdf.rect(
    pageWidth - 19.5,
    pageHeight - 18 - cornerSize,
    1.5,
    cornerSize,
    "F"
  );

  // Award badge at top - more space from border
  pdf.setFillColor(41, 128, 185);
  pdf.circle(pageWidth / 2, 45, 8, "F");

  // Main title - much more spacing
  pdf.setFontSize(42);
  pdf.setFont("helvetica", "bold");
  pdf.setTextColor(41, 128, 185);
  pdf.text("CERTIFICATE", pageWidth / 2, 72, { align: "center" });

  // Subtitle - more spacing
  pdf.setFontSize(13);
  pdf.setFont("helvetica", "normal");
  pdf.setTextColor(100, 100, 100);
  pdf.text("OF COMPLETION", pageWidth / 2, 85, { align: "center" });

  // Divider line - longer and more elegant
  pdf.setDrawColor(41, 128, 185);
  pdf.setLineWidth(0.3);
  pdf.line(pageWidth / 2 - 50, 92, pageWidth / 2 + 50, 92);

  // Presented to text - MUCH MORE spacing
  pdf.setFontSize(11);
  pdf.setFont("helvetica", "normal");
  pdf.setTextColor(80, 80, 80);
  pdf.text("This is proudly presented to", pageWidth / 2, 108, {
    align: "center",
  });

  // Student name - MUCH MORE spacing
  const studentName = validUserName;
  pdf.setFontSize(28);
  pdf.setFont("helvetica", "bold");
  pdf.setTextColor(52, 73, 94);

  // Handle long names
  let nameFontSize = 28;
  pdf.setFontSize(nameFontSize);
  let textWidth = pdf.getTextWidth(studentName);

  if (textWidth > 200) {
    nameFontSize = 22;
    pdf.setFontSize(nameFontSize);
    textWidth = pdf.getTextWidth(studentName);
  }

  pdf.text(studentName, pageWidth / 2, 125, { align: "center" });

  // Name underline - thinner and more elegant with more space
  pdf.setDrawColor(41, 128, 185);
  pdf.setLineWidth(0.5);
  pdf.line(
    pageWidth / 2 - textWidth / 2 - 5,
    130,
    pageWidth / 2 + textWidth / 2 + 5,
    130
  );

  // Completion text - MUCH MORE spacing
  pdf.setFontSize(11);
  pdf.setFont("helvetica", "normal");
  pdf.setTextColor(80, 80, 80);
  pdf.text("for successfully completing the course", pageWidth / 2, 145, {
    align: "center",
  });

  // Course name - THE MOST IMPORTANT PART - ensure it's always displayed
  const actualCourseName = validCourseName;
  console.log("🎯 FINAL COURSE NAME IN PDF:", actualCourseName);
  console.log("📏 Course name length:", actualCourseName.length);
  console.log(
    "🔤 Course name characters:",
    actualCourseName.split("").join(", ")
  );

  pdf.setFontSize(18);
  pdf.setFont("helvetica", "bold");
  pdf.setTextColor(41, 128, 185);

  // Split long course names with better width
  const maxWidth = 220;
  const courseLines = pdf.splitTextToSize(actualCourseName, maxWidth);
  const lineHeight = 10;
  const startY = 162;

  courseLines.forEach((line, index) => {
    pdf.text(line, pageWidth / 2, startY + index * lineHeight, {
      align: "center",
    });
  });

  // Course name box - cleaner and MORE spacious
  const totalHeight = courseLines.length * lineHeight;
  pdf.setDrawColor(41, 128, 185);
  pdf.setLineWidth(0.3);
  pdf.setFillColor(245, 250, 255);
  const boxWidth = maxWidth + 35;
  const boxPadding = 8;
  pdf.roundedRect(
    pageWidth / 2 - boxWidth / 2,
    startY - boxPadding - 4,
    boxWidth,
    totalHeight + boxPadding * 2,
    4,
    4,
    "FD"
  );

  // Redraw course name on top of box with emphasis
  pdf.setTextColor(41, 128, 185);
  pdf.setFont("helvetica", "bold");
  courseLines.forEach((line, index) => {
    pdf.text(line, pageWidth / 2, startY + index * lineHeight, {
      align: "center",
    });
  });

  // Date section - MUCH MORE spacing
  const dateY = startY + totalHeight + 35;

  const formattedDate = validCompletionDate.toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  pdf.setFontSize(12);
  pdf.setFont("helvetica", "normal");
  pdf.setTextColor(41, 128, 185);
  pdf.text(formattedDate, pageWidth / 2, dateY, { align: "center" });

  // Verification seal - smaller and cleaner
  const sealX = pageWidth / 2;
  const sealY = pageHeight - 32;

  pdf.setDrawColor(41, 128, 185);
  pdf.setLineWidth(1.2);
  pdf.circle(sealX, sealY, 8);

  pdf.setFillColor(41, 128, 185);
  pdf.circle(sealX, sealY, 6.5, "F");

  pdf.setFillColor(255, 255, 255);
  pdf.setFontSize(12);
  pdf.setFont("helvetica", "bold");
  pdf.text("✓", sealX, sealY + 1.5, { align: "center" });

  // Footer - cleaner
  pdf.setFontSize(7);
  pdf.setFont("helvetica", "normal");
  pdf.setTextColor(120, 120, 120);
  pdf.text(
    "E-Learning Platform - Professional Online Education",
    pageWidth / 2,
    pageHeight - 12,
    { align: "center" }
  );

  console.log(
    "✓ Certificate PDF generated successfully with course:",
    actualCourseName
  );
  return pdf;
};

export const downloadCertificatePDF = (pdf, fileName) => {
  console.log("Downloading PDF directly with filename:", fileName);
  try {
    // Download the PDF directly
    pdf.save(fileName);
    console.log("✓ PDF downloaded successfully");
    return true;
  } catch (error) {
    console.error("Error downloading PDF:", error);
    return false;
  }
};

export const uploadCertificatePDF = async (pdf, fileName) => {
  console.log("Converting PDF to file with name:", fileName);

  // Convert PDF to blob
  const blob = pdf.output("blob");
  console.log("PDF blob created, size:", blob.size, "bytes");

  // Create a File object from the blob
  const file = new File([blob], fileName, { type: "application/pdf" });
  console.log("File object created:", {
    name: file.name,
    size: file.size,
    type: file.type,
  });

  return file;
};
