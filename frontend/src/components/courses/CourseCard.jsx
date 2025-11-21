import React from 'react'
import { Card, Typography, Avatar } from '@mui/material'

const CourseCard = ({course}) => {

    const progressPercentage = (course.progress / course.total) * 100;

  return (
    <div style={{ backgroundColor: 'white', borderRadius: '16px', overflow: 'hidden', minWidth: '280px',
        maxWidth: '280px', cursor: 'pointer', transition: 'transform 0.2s', boxShadow: '0 2px 8px rgba(0,0,0,0.08)', margin: '5px'
     }} onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-4px)'}
        onMouseLeave={(e) => e.currentTarget.style.transform = 'translateY(0)'}>
        <div style={{position: 'relative', paddingTop: '50%', backgroundColor: '#f0f0f0' }}>
            <img src={course.thumbnail} alt={course.title} style={{ position: 'absolute',
                 top: 0, left: 0, width: '100%', height: '100%', objectFit: 'cover' }} />
        </div>

        <div style={{ padding: '12px' }}>
            <span style={{backgroundColor: 'E3F2FD', color: '#1976D2', fontSize: '11px', fontWeight: '700', padding: '4px 12px', letterSpacing: '0.5px'}}>
                {course.category}
            </span>
            <h3 style={{fontSize: '15px', fontWeight: '600', margin: '12px 0', lineHeight: '1.4',
                        color: '#333', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden'  
            }}>
                {course.title}
            </h3>

            <div>
                <div style={{ marginBottom: '12px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px'}}>
                        <span style={{ fontSize: '12px', color: '#666' }}>
                            {Math.round(progressPercentage)}%
                        </span>
                    </div>

                    <div style={{ width: '100%', height: '6px', backgroundColor: '#E0E0E0', borderRadius: '10px', overflow: 'hidden' }}>
                        <div style={{ width: `${progressPercentage}%`, height: '100%', backgroundColor: '#5B8DEF', borderRadius: '10px', transition: 'width 0.3s ease' }} />
                    </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <div style={{ width: '32px', height: '32px', borderRadius: '50%', backgroundColor: '#E0E0E0',
                                    backgroundImage: 'url(https://i.pinimg.com/736x/82/a1/50/82a15066e1554597f88aaae2d7c6b135.jpg)', backgroundSize: 'cover' }} />
                        
                        <div>
                            <p style={{ fontSize: '13px', fontWeight: '600', margin: 0, color: '#333' }}>
                                {course.instructor}
                            </p>
                            <p style={{ fontSize: '11px', margin: 0, color: '#999' }}>
                                {course.role}
                            </p>
                        </div>
                </div>
            </div>
        </div>
    </div>
  )
}

export default CourseCard
