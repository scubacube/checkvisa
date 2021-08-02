import React from 'react';
import classes from './Result.module.css';

let Result = (props) => {
    const resultBoldRus =
        props.status === 'POVOLENO' ? 'одобрено!' : (props.status === 'NENALEZENO' ? 'не найдена' : (props.status === 'Zpracovává se' ? 'рассматривается' :'отклонена'))
    const resultBoldEng =
        props.status === 'POVOLENO' ? 'approved!' : (props.status === 'NENALEZENO' ? 'not found' : (props.status === 'Zpracovává se' ? 'in process' : 'declined'))
    return (
    <div className={classes.result}>

                <h5>{props.lang === 'eng' ?
                    <span>The status of your application is: <b>{resultBoldEng}</b></span>
                    : <span>Статус вашей заявки: <b>{resultBoldRus}</b></span>
                }</h5>
        {
            props.status === 'Zpracovává se' ?
                <div>
                    { props.lang === 'eng' ? <p>
                        We will notify you by email if your application is considered
                    </p>: <p>
                        Мы уведомим вас по электронной почте, если ваша заявка будет рассмотрена
                    </p>}
                </div> :
                ''
        }
    </div>
    )
}

export default Result;