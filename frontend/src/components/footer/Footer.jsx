import React from 'react'
import PhoneIcon from '@mui/icons-material/Phone';
import MailIcon from '@mui/icons-material/Mail';
import LocationIcon from '@mui/icons-material/LocationPin';
import Facebook from '@mui/icons-material/Facebook';
import X from '@mui/icons-material/X';
import Linkedin from '@mui/icons-material/LinkedIn';
import Instagram from '@mui/icons-material/Instagram';
import Youtube from '@mui/icons-material/YouTube';

const Footer = () => {
  return (
    <div style={{ width: '100%', background: '#0f0f14', color: '#fff', padding: '60px 24px 30px' }}>
      <div style={{ maxWidth: '100%', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
                    gap: '40px', marginBottom: '40px' }}>
        <div>
          <h3 style={{ margin: 0, marginBottom: '16px', fontSize: '20px', fontWeight: '700', color: '#fff' }}>
            E Learning Platform
          </h3>
          <p style={{ margin: '12px 0', color: '#b8b8b8', fontSize: '14px', lineHeight: '1.6' }}>
            Empowering learners worldwide with professional online courses and mentorship.
          </p>

          <div style={{ marginTop: '20px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '10px' }}>
              <PhoneIcon sx={{width: 20, height: 20}} />
              <span style={{ color: '#d0d0d0', fontSize: '14px' }}> Phone + 0988 888 888</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '10px' }}>
              <MailIcon sx={{width: 20, height: 20}} />
              <span style={{ color: '#d0d0d0', fontSize: '14px' }}> Email: contact@edulearn.com</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '10px' }}>
              <LocationIcon sx={{width: 20, height: 20}} />
              <span style={{ color: '#d0d0d0', fontSize: '14px' }}> No.1, Dai Co Viet Street, Hai Ba Trung District, Hanoi</span>
            </div>
          </div>
        </div>

        <div>
          <h4 style={{marginBottom: '16px', fontSize: '16px', fontWeight: '600', color: '#fff'}}>
            Quick links
          </h4>
          {['About Us', 'Courses', 'Instructors', 'Contact', 'Blog', 'FAQ'].map((item, index) => (
            <p key={index} style={{ margin: '8px 0', color: '#b8b8b8', fontSize: '14px', 
                                    cursor: 'pointer', transition: 'all 0.2s'
             }} onMouseEnter={(e) => {
              e.currentTarget.style.color = "#97A87A";
              e.currentTarget.style.paddingLeft = '8px';
             }} onMouseLeave={(e) => {
              e.currentTarget.style.color = '#b8b8b8';
              e.currentTarget.style.paddingLeft = '0'
             }}>
              {item}
            </p>
          ))}
        </div>

        <div>
          <h4 style={{ marginBottom: '16px', fontSize: '16px', fontWeight: '600', color: '#fff' }}>
            Categories
          </h4>
          {['Web Development', 'Mobile Development', 'Data Science', 'UI/UX Design', 'Digital Marketing', 'Business'].map((item, index) => (
            <p key={index} style={{ margin: '8px 0', color: '#b8b8b8', fontSize: '14px', cursor: 'pointer', transition: 'all 0.2s' }}
            onMouseEnter={(e) => {
              e.currentTarget.style.color = '#97A87A'; 
              e.currentTarget.style.paddingLeft = '8px';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.color = '#b8b8b8'; 
              e.currentTarget.style.paddingLeft = '0';
            }}
            >
              {item}
            </p>
          ))}
        </div>

        <div>
          <h4 style={{ marginBottom: '16px', fontSize: '16px', fontWeight: '600', color: '#fff' }}>
            Support
          </h4>
          {['Help Center', 'Terms of Service', 'Privacy Policy', 'Career', 'Become an Instructor'].map((item, index) => (
            <p key={index} style={{ margin: '8px 0', color: '#b8b8b8', fontSize: '14px', cursor: 'pointer', transition: 'all 0.2s' }}
            onMouseEnter={(e) => {
              e.currentTarget.style.color = '#97A87A';
              e.currentTarget.style.paddingLeft = '8px';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.color = '#b8b8b8';
              e.currentTarget.style.paddingLeft = '0';
            }}>
              {item}
            </p>
          ))}
        </div>
      </div>

      <div style={{ width: '100%', height: '1px', background: 'white', margin: '30px 0' }}/>

      <div style={{
        display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '20px'
      }}>
        <p style={{ margin: 0, color: '#888', fontSize: '14px' }}>
          © 2025 EduLearn Platform. All rights reserved.
        </p>

        <div style={{ display: 'flex', gap: '12px' }}>
          {[
            { Icon: Facebook, color: '#1877F2' },
            { Icon: X, color: '#000' },
            { Icon: Instagram, color: '#E4405F' },
            { Icon: Linkedin, color: '#0A66C2' },
            { Icon: Youtube, color: '#FF0000' },
          ].map(({Icon, color}, index) => (
            <div key={index} style={{ width: '36px', height: '36px', borderRadius: '50%', backgroundColor: 'rgba(255, 255, 255, 0.05)',
                                      display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', transition: 'all 0.2s' }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = color;
                  e.currentTarget.style.transform = 'translateY(-3px)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.05)';
                  e.currentTarget.style.transform = 'translateY(0)';
                }}> 
              <Icon sx={{ color: '#fff' }}/>  
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

export default Footer
