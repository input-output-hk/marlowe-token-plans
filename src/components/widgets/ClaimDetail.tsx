import React from 'react';

interface ClaimDetailProps {
  imgSrc: string;
  altText: string;
  label: string;
  value: string;
}

const ClaimDetail: React.FC<ClaimDetailProps> = ({ imgSrc, altText, label, value }) => {
  return (
    <div className="row my-3">
      <div className="col-6 font-weight-bold text-color-gray">
        <span className='icon'>
          <img src={imgSrc} alt={altText} />
        </span>
        <span className='label'>{label}</span>
      </div>
      <div className="col-6 font-weight-bold text-color-black">
        <span>{value}</span>
      </div>
    </div>
  );
};

export default ClaimDetail;
