import prisma from "../configs/prisma.config.js";
import { NotFoundError } from "../errors/NotFoundError.js";
import { BadRequestError } from "../errors/BadRequestError.js";

/**
 * Get overview statistics for admin dashboard
 */
const getOverviewStatistics = async () => {
  try {
    const [
      totalUsers,
      totalCourses,
      totalEnrollments,
      totalRevenue,
      activeUsers,
      publishedCourses,
      pendingPayments,
      completedCertificates,
    ] = await Promise.all([
      // Total users count
      prisma.user.count(),

      // Total courses count
      prisma.course.count(),

      // Total enrollments count
      prisma.enrollment.count(),

      // Total revenue from successful payments
      prisma.payment.aggregate({
        where: { status: "success", amountVND: { gte: 0 } },
        _sum: { amountVND: true },
      }),

      // Active users (users who are active)
      prisma.user.count({
        where: { isActive: true },
      }),

      // Published courses count
      prisma.course.count({
        where: { isPublished: true },
      }),

      // Pending payments count
      prisma.payment.count({
        where: { status: "pending" },
      }),

      // Completed certificates count
      prisma.certificate.count(),
    ]);

    return {
      users: {
        total: totalUsers,
        active: activeUsers,
        inactive: totalUsers - activeUsers,
      },
      courses: {
        total: totalCourses,
        published: publishedCourses,
        unpublished: totalCourses - publishedCourses,
      },
      enrollments: {
        total: totalEnrollments,
      },
      revenue: {
        total: totalRevenue._sum.amountVND || 0,
        currency: "VND",
      },
      payments: {
        pending: pendingPayments,
      },
      certificates: {
        issued: completedCertificates,
      },
    };
  } catch (error) {
    console.error("Get overview statistics error:", error);
    throw error;
  }
};

/**
 * Get user statistics with detailed breakdown
 */
const getUserStatistics = async (filters = {}) => {
  try {
    const where = {};

    // Apply date range filter if provided
    if (filters.startDate || filters.endDate) {
      where.createdAt = {};
      if (filters.startDate) {
        where.createdAt.gte = new Date(filters.startDate);
      }
      if (filters.endDate) {
        where.createdAt.lte = new Date(filters.endDate);
      }
    }

    const [
      totalUsers,
      usersByRole,
      usersByGender,
      verifiedUsers,
      recentRegistrations,
    ] = await Promise.all([
      // Total users
      prisma.user.count({ where }),

      // Users grouped by role
      prisma.user.groupBy({
        by: ["role"],
        where,
        _count: { id: true },
      }),

      // Users grouped by gender
      prisma.user.groupBy({
        by: ["gender"],
        where,
        _count: { id: true },
      }),

      // Verified users count
      prisma.user.count({
        where: { ...where, emailVerified: true },
      }),

      // Recent registrations (last 30 days or within filtered date range)
      prisma.user.count({
        where:
          filters.startDate || filters.endDate
            ? where // If date filters are provided, count all users in that range
            : {
                createdAt: {
                  gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
                },
              },
      }),
    ]);

    const roleDistribution = usersByRole.reduce((acc, item) => {
      acc[item.role] = item._count.id;
      return acc;
    }, {});

    const genderDistribution = usersByGender.reduce((acc, item) => {
      if (item.gender) {
        acc[item.gender] = item._count.id;
      }
      return acc;
    }, {});

    return {
      total: totalUsers,
      verified: verifiedUsers,
      unverified: totalUsers - verifiedUsers,
      recentRegistrations,
      roleDistribution,
      genderDistribution,
    };
  } catch (error) {
    console.error("Get user statistics error:", error);
    throw error;
  }
};

/**
 * Get course statistics with detailed breakdown
 */
const getCourseStatistics = async (filters = {}) => {
  try {
    const where = {};

    // Apply date range filter if provided
    if (filters.startDate || filters.endDate) {
      where.createdAt = {};
      if (filters.startDate) {
        where.createdAt.gte = new Date(filters.startDate);
      }
      if (filters.endDate) {
        where.createdAt.lte = new Date(filters.endDate);
      }
    }

    const [
      totalCourses,
      publishedCourses,
      coursesWithEnrollments,
      totalEnrollments,
      avgEnrollmentsPerCourse,
      topCourses,
    ] = await Promise.all([
      // Total courses
      prisma.course.count({ where }),

      // Published courses
      prisma.course.count({
        where: { ...where, isPublished: true },
      }),

      // Courses with at least one enrollment - use count with having clause
      prisma.course.count({
        where: {
          ...where,
          enrollments: {
            some:
              filters.startDate || filters.endDate
                ? {
                    enrolledAt: {
                      ...(filters.startDate && {
                        gte: new Date(filters.startDate),
                      }),
                      ...(filters.endDate && {
                        lte: new Date(filters.endDate),
                      }),
                    },
                  }
                : {},
          },
        },
      }),

      // Total enrollments
      prisma.enrollment.count({
        where:
          filters.startDate || filters.endDate
            ? {
                enrolledAt: {
                  ...(filters.startDate && {
                    gte: new Date(filters.startDate),
                  }),
                  ...(filters.endDate && { lte: new Date(filters.endDate) }),
                },
              }
            : {},
      }),

      // Average enrollments per course
      prisma.enrollment.groupBy({
        by: ["courseId"],
        where:
          filters.startDate || filters.endDate
            ? {
                enrolledAt: {
                  ...(filters.startDate && {
                    gte: new Date(filters.startDate),
                  }),
                  ...(filters.endDate && { lte: new Date(filters.endDate) }),
                },
              }
            : {},
        _count: { id: true },
      }),

      // Top courses by enrollment count - use groupBy for performance
      prisma.enrollment.groupBy({
        by: ["courseId"],
        where:
          filters.startDate || filters.endDate
            ? {
                enrolledAt: {
                  ...(filters.startDate && {
                    gte: new Date(filters.startDate),
                  }),
                  ...(filters.endDate && { lte: new Date(filters.endDate) }),
                },
              }
            : {},
        _count: { id: true },
        orderBy: { _count: { id: "desc" } },
        take: 10,
      }),
    ]);

    const coursesWithActiveEnrollments = coursesWithEnrollments;

    const avgEnrollments =
      avgEnrollmentsPerCourse.length > 0
        ? avgEnrollmentsPerCourse.reduce(
            (sum, item) => sum + item._count.id,
            0
          ) / avgEnrollmentsPerCourse.length
        : 0;

    // Fetch course details and reviews separately for top courses
    const topCourseIds = topCourses.map((item) => item.courseId);
    const [topCoursesDetails, topCoursesReviews] =
      topCourseIds.length > 0
        ? await Promise.all([
            prisma.course.findMany({
              where: { id: { in: topCourseIds } },
              select: { id: true, title: true, slug: true, priceVND: true },
            }),
            prisma.review.groupBy({
              by: ["courseId"],
              where: {
                courseId: { in: topCourseIds },
                ...(filters.startDate || filters.endDate
                  ? {
                      createdAt: {
                        ...(filters.startDate && {
                          gte: new Date(filters.startDate),
                        }),
                        ...(filters.endDate && {
                          lte: new Date(filters.endDate),
                        }),
                      },
                    }
                  : {}),
              },
              _avg: { rating: true },
              _count: { id: true },
            }),
          ])
        : [[], []];

    // Join data using JS
    const topCoursesWithRating = topCourses.map((enrollment) => {
      const course = topCoursesDetails.find(
        (c) => c.id === enrollment.courseId
      );
      const reviewStats = topCoursesReviews.find(
        (r) => r.courseId === enrollment.courseId
      );

      return {
        id: enrollment.courseId,
        title: course?.title || "Unknown",
        slug: course?.slug || "",
        priceVND: course?.priceVND || 0,
        enrollments: enrollment._count.id,
        reviews: reviewStats?._count.id || 0,
        averageRating: reviewStats?._avg.rating
          ? parseFloat(reviewStats._avg.rating.toFixed(2))
          : 0,
      };
    });

    return {
      total: totalCourses,
      published: publishedCourses,
      unpublished: totalCourses - publishedCourses,
      withEnrollments: coursesWithActiveEnrollments,
      totalEnrollments,
      averageEnrollmentsPerCourse: parseFloat(avgEnrollments.toFixed(2)),
      topCourses: topCoursesWithRating,
    };
  } catch (error) {
    console.error("Get course statistics error:", error);
    throw error;
  }
};

/**
 * Get revenue statistics with detailed breakdown
 */
const getRevenueStatistics = async (filters = {}) => {
  try {
    const where = { status: "success", amountVND: { gte: 0 } };

    // Apply date range filter if provided
    if (filters.startDate || filters.endDate) {
      where.createdAt = {};
      if (filters.startDate) {
        where.createdAt.gte = new Date(filters.startDate);
      }
      if (filters.endDate) {
        where.createdAt.lte = new Date(filters.endDate);
      }
    }

    const [totalRevenue, paymentsByStatus, revenueByMonth, topRevenueCourses] =
      await Promise.all([
        // Total revenue from successful payments
        prisma.payment.aggregate({
          where,
          _sum: { amountVND: true },
          _count: { id: true },
          _avg: { amountVND: true },
        }),

        // Payments grouped by status
        prisma.payment.groupBy({
          by: ["status"],
          where: {
            amountVND: { gte: 0 },
            ...(filters.startDate || filters.endDate
              ? { createdAt: where.createdAt }
              : {}),
          },
          _count: { id: true },
          _sum: { amountVND: true },
        }),

        // Revenue by month (last 12 months or filtered period)
        filters.startDate || filters.endDate
          ? prisma.$queryRaw`
              SELECT 
                DATE_TRUNC('month', "createdAt") as month,
                COUNT(*)::int as count,
                SUM("amountVND")::bigint as revenue
              FROM "Payment"
              WHERE "status" = 'success' AND "amountVND" >= 0
                ${
                  filters.startDate
                    ? prisma.Prisma.sql`AND "createdAt" >= ${new Date(
                        filters.startDate
                      )}::timestamp`
                    : prisma.Prisma.empty
                }
                ${
                  filters.endDate
                    ? prisma.Prisma.sql`AND "createdAt" <= ${new Date(
                        filters.endDate
                      )}::timestamp`
                    : prisma.Prisma.empty
                }
              GROUP BY DATE_TRUNC('month', "createdAt")
              ORDER BY month DESC
              LIMIT 12
            `
          : prisma.$queryRaw`
              SELECT 
                DATE_TRUNC('month', "createdAt") as month,
                COUNT(*)::int as count,
                SUM("amountVND")::bigint as revenue
              FROM "Payment"
              WHERE "status" = 'success' AND "amountVND" >= 0
              GROUP BY DATE_TRUNC('month', "createdAt")
              ORDER BY month DESC
              LIMIT 12
            `,

        // Top 10 courses by revenue
        prisma.payment.groupBy({
          by: ["courseId"],
          where,
          _sum: { amountVND: true },
          _count: { id: true },
          orderBy: {
            _sum: {
              amountVND: "desc",
            },
          },
          take: 10,
        }),
      ]);

    // Get course details for top revenue courses
    const topCourseIds = topRevenueCourses.map((item) => item.courseId);
    const courseDetails = await prisma.course.findMany({
      where: { id: { in: topCourseIds } },
      select: {
        id: true,
        title: true,
        slug: true,
        priceVND: true,
      },
    });

    const topCoursesWithDetails = topRevenueCourses.map((item) => {
      const course = courseDetails.find((c) => c.id === item.courseId);
      return {
        courseId: item.courseId,
        courseTitle: course?.title || "Unknown",
        courseSlug: course?.slug || "",
        revenue: item._sum.amountVND || 0,
        transactionCount: item._count.id,
      };
    });

    const paymentStatusDistribution = paymentsByStatus.reduce((acc, item) => {
      acc[item.status] = {
        count: item._count.id,
        amount: item._sum.amountVND || 0,
      };
      return acc;
    }, {});

    const monthlyRevenue = revenueByMonth.map((item) => ({
      month: item.month,
      count: item.count,
      revenue: Number(item.revenue) || 0,
    }));

    return {
      total: {
        revenue: totalRevenue._sum.amountVND || 0,
        transactionCount: totalRevenue._count.id,
        averageTransaction:
          totalRevenue._avg.amountVND != null
            ? parseFloat(totalRevenue._avg.amountVND.toFixed(2))
            : 0,
        currency: "VND",
      },
      paymentStatusDistribution,
      monthlyRevenue,
      topCourses: topCoursesWithDetails,
    };
  } catch (error) {
    console.error("Get revenue statistics error:", error);
    throw error;
  }
};

/**
 * Get learning progress statistics
 */
const getLearningStatistics = async (filters = {}) => {
  try {
    // Build date range filters for different entities
    const enrollmentWhere = {};
    const lessonProgressWhere = { isCompleted: true };
    const quizWhere = { completedAt: { not: null } };
    const certificateWhere = {};

    if (filters.startDate || filters.endDate) {
      // Filter enrollments by enrolledAt
      enrollmentWhere.enrolledAt = {};
      if (filters.startDate) {
        enrollmentWhere.enrolledAt.gte = new Date(filters.startDate);
      }
      if (filters.endDate) {
        enrollmentWhere.enrolledAt.lte = new Date(filters.endDate);
      }

      // Filter lesson progress by lastAccessedAt
      lessonProgressWhere.lastAccessedAt = {};
      if (filters.startDate) {
        lessonProgressWhere.lastAccessedAt.gte = new Date(filters.startDate);
      }
      if (filters.endDate) {
        lessonProgressWhere.lastAccessedAt.lte = new Date(filters.endDate);
      }

      // Filter quiz attempts by completedAt
      quizWhere.completedAt = {};
      if (filters.startDate) {
        quizWhere.completedAt.gte = new Date(filters.startDate);
      }
      if (filters.endDate) {
        quizWhere.completedAt.lte = new Date(filters.endDate);
      }

      // Filter certificates by issuedAt
      certificateWhere.issuedAt = {};
      if (filters.startDate) {
        certificateWhere.issuedAt.gte = new Date(filters.startDate);
      }
      if (filters.endDate) {
        certificateWhere.issuedAt.lte = new Date(filters.endDate);
      }
    }

    const [
      totalLessons,
      completedLessons,
      totalQuizAttempts,
      averageQuizScores,
      certificatesIssued,
      activeLearners,
    ] = await Promise.all([
      // Total lessons (no date filter as lessons are static content)
      prisma.lesson.count(),

      // Completed lessons (filtered by lastAccessedAt)
      prisma.lessonProgress.count({
        where: lessonProgressWhere,
      }),

      // Total quiz attempts (filtered by completedAt)
      prisma.quizAttempt.count({
        where: quizWhere,
      }),

      // Average quiz scores (filtered by completedAt)
      prisma.quizAttempt.aggregate({
        where: { ...quizWhere, score: { not: null } },
        _avg: { score: true },
      }),

      // Certificates issued (filtered by issuedAt)
      prisma.certificate.count({
        where: certificateWhere,
      }),

      // Active learners (users with lesson progress in the filtered period or last 30 days)
      prisma.lessonProgress.groupBy({
        by: ["userId"],
        where: {
          lastAccessedAt:
            filters.startDate || filters.endDate
              ? lessonProgressWhere.lastAccessedAt
              : {
                  gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), // Last 30 days if no filter
                },
        },
        _count: { userId: true },
      }),
    ]);

    const totalEnrollments = await prisma.enrollment.count({
      where: enrollmentWhere,
    });
    const completionRate =
      totalEnrollments > 0
        ? parseFloat(((certificatesIssued / totalEnrollments) * 100).toFixed(2))
        : 0;

    return {
      lessons: {
        total: totalLessons,
        completed: completedLessons,
        completionRate:
          totalLessons > 0
            ? parseFloat(((completedLessons / totalLessons) * 100).toFixed(2))
            : 0,
      },
      quizzes: {
        totalAttempts: totalQuizAttempts,
        averageScore:
          averageQuizScores._avg.score != null
            ? parseFloat(averageQuizScores._avg.score.toFixed(2))
            : 0,
      },
      certificates: {
        issued: certificatesIssued,
        completionRate: completionRate,
      },
      activeLearners: activeLearners.length,
    };
  } catch (error) {
    console.error("Get learning statistics error:", error);
    throw error;
  }
};

/**
 * Get engagement statistics
 */
const getEngagementStatistics = async (filters = {}) => {
  try {
    const where = {};

    // Apply date range filter if provided
    if (filters.startDate || filters.endDate) {
      where.createdAt = {};
      if (filters.startDate) {
        where.createdAt.gte = new Date(filters.startDate);
      }
      if (filters.endDate) {
        where.createdAt.lte = new Date(filters.endDate);
      }
    }

    const [
      totalReviews,
      averageRating,
      totalDiscussions,
      totalLessonNotes,
      totalSupportTickets,
      openTickets,
      totalNotifications,
      unreadNotifications,
    ] = await Promise.all([
      // Total reviews
      prisma.review.count({ where }),

      // Average rating across all reviews
      prisma.review.aggregate({
        where,
        _avg: { rating: true },
      }),

      // Total discussions
      prisma.discussion.count({ where }),

      // Total lesson notes
      prisma.lessonNote.count({ where }),

      // Total support tickets
      prisma.supportTicket.count({ where }),

      // Open support tickets
      prisma.supportTicket.count({
        where: { ...where, status: { in: ["open", "in_progress"] } },
      }),

      // Total notifications
      prisma.notification.count({ where }),

      // Unread notifications
      prisma.notification.count({
        where: { ...where, isRead: false },
      }),
    ]);

    // Reviews by rating distribution
    const reviewsByRating = await prisma.review.groupBy({
      by: ["rating"],
      where,
      _count: { id: true },
    });

    const ratingDistribution = reviewsByRating.reduce((acc, item) => {
      acc[`rating_${item.rating}`] = item._count.id;
      return acc;
    }, {});

    // Support tickets by status
    const ticketsByStatus = await prisma.supportTicket.groupBy({
      by: ["status"],
      where,
      _count: { id: true },
    });

    const ticketStatusDistribution = ticketsByStatus.reduce((acc, item) => {
      acc[item.status] = item._count.id;
      return acc;
    }, {});

    return {
      reviews: {
        total: totalReviews,
        averageRating:
          averageRating._avg.rating != null
            ? parseFloat(averageRating._avg.rating.toFixed(2))
            : 0,
        ratingDistribution,
      },
      discussions: {
        total: totalDiscussions,
      },
      lessonNotes: {
        total: totalLessonNotes,
      },
      supportTickets: {
        total: totalSupportTickets,
        open: openTickets,
        resolved: totalSupportTickets - openTickets,
        statusDistribution: ticketStatusDistribution,
      },
      notifications: {
        total: totalNotifications,
        unread: unreadNotifications,
        read: totalNotifications - unreadNotifications,
      },
    };
  } catch (error) {
    console.error("Get engagement statistics error:", error);
    throw error;
  }
};

/**
 * Get instructor performance statistics
 */
const getInstructorStatistics = async (filters = {}) => {
  try {
    // Build date range filters for different entities
    const courseWhere = {};
    const enrollmentWhere = {};
    const reviewWhere = {};
    const paymentWhere = { status: "success", amountVND: { gte: 0 } };

    if (filters.startDate || filters.endDate) {
      // Filter courses by createdAt
      courseWhere.createdAt = {};
      if (filters.startDate) {
        courseWhere.createdAt.gte = new Date(filters.startDate);
      }
      if (filters.endDate) {
        courseWhere.createdAt.lte = new Date(filters.endDate);
      }

      // Filter enrollments by enrolledAt
      enrollmentWhere.enrolledAt = {};
      if (filters.startDate) {
        enrollmentWhere.enrolledAt.gte = new Date(filters.startDate);
      }
      if (filters.endDate) {
        enrollmentWhere.enrolledAt.lte = new Date(filters.endDate);
      }

      // Filter reviews by createdAt
      reviewWhere.createdAt = {};
      if (filters.startDate) {
        reviewWhere.createdAt.gte = new Date(filters.startDate);
      }
      if (filters.endDate) {
        reviewWhere.createdAt.lte = new Date(filters.endDate);
      }

      // Filter payments by createdAt
      paymentWhere.createdAt = {};
      if (filters.startDate) {
        paymentWhere.createdAt.gte = new Date(filters.startDate);
      }
      if (filters.endDate) {
        paymentWhere.createdAt.lte = new Date(filters.endDate);
      }
    }

    // Get instructors and their course data separately, then join with JS
    const instructors = await prisma.user.findMany({
      where: { role: "instructor" },
      select: {
        id: true,
        username: true,
        email: true,
        firstName: true,
        lastName: true,
      },
    });

    if (instructors.length === 0) {
      return {
        totalInstructors: 0,
        instructors: [],
        topInstructors: [],
      };
    }

    const instructorIds = instructors.map((i) => i.id);

    // Get course statistics for all instructors in parallel
    const [courses, enrollmentStats, reviewStats, revenueStats] =
      await Promise.all([
        prisma.course.findMany({
          where: { instructorId: { in: instructorIds }, ...courseWhere },
          select: { id: true, instructorId: true, isPublished: true },
        }),
        prisma.enrollment.groupBy({
          by: ["courseId"],
          where: {
            course: { instructorId: { in: instructorIds } },
            ...enrollmentWhere,
          },
          _count: { id: true },
        }),
        prisma.review.groupBy({
          by: ["courseId"],
          where: {
            course: { instructorId: { in: instructorIds } },
            ...reviewWhere,
          },
          _avg: { rating: true },
          _count: { id: true },
        }),
        prisma.payment.groupBy({
          by: ["courseId"],
          where: {
            course: { instructorId: { in: instructorIds } },
            ...paymentWhere,
          },
          _sum: { amountVND: true },
        }),
      ]);

    // Build lookup maps for efficient joining
    const enrollmentMap = new Map(
      enrollmentStats.map((e) => [e.courseId, e._count.id])
    );
    const reviewMap = new Map(
      reviewStats.map((r) => [
        r.courseId,
        { avg: r._avg.rating, count: r._count.id },
      ])
    );
    const revenueMap = new Map(
      revenueStats.map((p) => [p.courseId, p._sum.amountVND || 0])
    );

    const instructorStats = instructors.map((instructor) => {
      const instructorCourses = courses.filter(
        (c) => c.instructorId === instructor.id
      );
      const totalCourses = instructorCourses.length;
      const publishedCourses = instructorCourses.filter(
        (c) => c.isPublished
      ).length;

      let totalEnrollments = 0;
      let totalReviews = 0;
      let totalRatingSum = 0;
      let totalRevenue = 0;

      instructorCourses.forEach((course) => {
        totalEnrollments += enrollmentMap.get(course.id) || 0;
        const reviewData = reviewMap.get(course.id);
        if (reviewData) {
          totalReviews += reviewData.count;
          totalRatingSum += (reviewData.avg || 0) * reviewData.count;
        }
        totalRevenue += revenueMap.get(course.id) || 0;
      });

      const averageRating =
        totalReviews > 0 ? totalRatingSum / totalReviews : 0;

      return {
        instructorId: instructor.id,
        instructorName:
          `${instructor.firstName || ""} ${instructor.lastName || ""}`.trim() ||
          instructor.username,
        email: instructor.email,
        totalCourses,
        publishedCourses,
        totalEnrollments,
        totalReviews,
        averageRating: parseFloat(averageRating.toFixed(2)),
        totalRevenue,
      };
    });

    // Sort by total enrollments
    instructorStats.sort((a, b) => b.totalEnrollments - a.totalEnrollments);

    return {
      totalInstructors: instructors.length,
      instructors: instructorStats,
      topInstructors: instructorStats.slice(0, 10),
    };
  } catch (error) {
    console.error("Get instructor statistics error:", error);
    throw error;
  }
};

/**
 * Generate comprehensive report with all statistics
 */
const generateComprehensiveReport = async (filters = {}) => {
  try {
    const [
      overview,
      users,
      courses,
      revenue,
      learning,
      engagement,
      instructors,
    ] = await Promise.all([
      getOverviewStatistics(),
      getUserStatistics(filters),
      getCourseStatistics(filters),
      getRevenueStatistics(filters),
      getLearningStatistics(filters),
      getEngagementStatistics(filters),
      getInstructorStatistics(filters),
    ]);

    return {
      generatedAt: new Date().toISOString(),
      filters: {
        startDate: filters.startDate || null,
        endDate: filters.endDate || null,
      },
      overview,
      users,
      courses,
      revenue,
      learning,
      engagement,
      instructors: {
        total: instructors.totalInstructors,
        topPerformers: instructors.topInstructors,
      },
    };
  } catch (error) {
    console.error("Generate comprehensive report error:", error);
    throw error;
  }
};

/**
 * Get growth trends over time
 */
const getGrowthTrends = async (period = "monthly", limit = 12) => {
  try {
    // Map period values to PostgreSQL date_trunc formats
    const periodMap = {
      daily: "day",
      weekly: "week",
      monthly: "month",
      yearly: "year",
    };

    const dateFormat = periodMap[period] || "month";

    const userGrowth = await prisma.$queryRawUnsafe(`
      SELECT 
        DATE_TRUNC('${dateFormat}', "createdAt") as period,
        COUNT(*)::int as count
      FROM "User"
      GROUP BY DATE_TRUNC('${dateFormat}', "createdAt")
      ORDER BY period DESC
      LIMIT ${limit}
    `);

    // Course creation trends
    const courseGrowth = await prisma.$queryRawUnsafe(`
      SELECT 
        DATE_TRUNC('${dateFormat}', "createdAt") as period,
        COUNT(*)::int as count
      FROM "Course"
      GROUP BY DATE_TRUNC('${dateFormat}', "createdAt")
      ORDER BY period DESC
      LIMIT ${limit}
    `);

    // Enrollment trends
    const enrollmentGrowth = await prisma.$queryRawUnsafe(`
      SELECT 
        DATE_TRUNC('${dateFormat}', "enrolledAt") as period,
        COUNT(*)::int as count
      FROM "Enrollment"
      GROUP BY DATE_TRUNC('${dateFormat}', "enrolledAt")
      ORDER BY period DESC
      LIMIT ${limit}
    `);

    // Revenue trends
    const revenueGrowth = await prisma.$queryRawUnsafe(`
      SELECT 
        DATE_TRUNC('${dateFormat}', "createdAt") as period,
        COUNT(*)::int as count,
        SUM("amountVND")::bigint as revenue
      FROM "Payment"
      WHERE "status" = 'success' AND "amountVND" >= 0
      GROUP BY DATE_TRUNC('${dateFormat}', "createdAt")
      ORDER BY period DESC
      LIMIT ${limit}
    `);

    return {
      period,
      userGrowth: userGrowth.map((item) => ({
        period: item.period,
        count: item.count,
      })),
      courseGrowth: courseGrowth.map((item) => ({
        period: item.period,
        count: item.count,
      })),
      enrollmentGrowth: enrollmentGrowth.map((item) => ({
        period: item.period,
        count: item.count,
      })),
      revenueGrowth: revenueGrowth.map((item) => ({
        period: item.period,
        count: item.count,
        revenue: Number(item.revenue) || 0,
      })),
    };
  } catch (error) {
    console.error("Get growth trends error:", error);
    throw error;
  }
};

export default {
  getOverviewStatistics,
  getUserStatistics,
  getCourseStatistics,
  getRevenueStatistics,
  getLearningStatistics,
  getEngagementStatistics,
  getInstructorStatistics,
  generateComprehensiveReport,
  getGrowthTrends,
};
