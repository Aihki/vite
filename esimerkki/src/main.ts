import {errorModal, restaurantModal, restaurantRow} from './components.ts';
import {fetchData} from './functions.ts';
import { Menu } from './interfaces/Menu.ts';
/* import { Point } from './interfaces/Point.ts'; */
import { Restaurant } from './interfaces/Restaurant.ts';
import {apiUrl, positionOptions} from './variables.ts';
import './main.css';

const modal = document.querySelector('dialog');
if (!modal) {
  throw new Error('Modal not found');
}
modal.addEventListener('click', () => {
  modal.close();
});

const calculateDistance = (x1: number, y1: number, x2: number, y2: number) =>
  Math.sqrt((x2 - x1) ** 2 + (y2 - y1) ** 2);

const createTable = (restaurants : Restaurant[]) => {
  const table = document.querySelector('table');
  if (!table){
    throw new Error('table doent exist')
  }
  table.innerHTML = '';
  restaurants.forEach((restaurant) => {
    const tr = restaurantRow(restaurant);
    if (table)
    table.appendChild(tr);
    tr.addEventListener('click', async () => {
      try {

        const allHighs = document.querySelectorAll('.highlight');
        allHighs.forEach((high) => {
          high.classList.remove('highlight');
        });

        tr.classList.add('highlight');

        modal.innerHTML = '';


        const menu = await fetchData<Menu>(
          apiUrl + `/restaurants/daily/${restaurant._id}/fi`
        );

        console.log(menu);

        const menuHtml = restaurantModal(restaurant, menu);
        modal.insertAdjacentHTML('beforeend', menuHtml);

        modal.showModal();
      } catch (error) {
        modal.innerHTML = errorModal((error as Error).message);
        modal.showModal();
      }
    });
  });
};

const error = (err: GeolocationPositionError) => {
  console.warn(`ERROR(${err.code}): ${err.message}`);
};

const success = async (pos: GeolocationPosition) => {
  try {
    const crd = pos.coords;
    const restaurants = await fetchData<Restaurant[]>(apiUrl + '/restaurants');
    console.log(restaurants);
    restaurants.sort((a, b) => {
      const x1 = crd.latitude;
      const y1 = crd.longitude;
      const x2a = a.location.coordinates[1]
      const y2a = a.location.coordinates[0];
      const distanceA = calculateDistance(x1, y1, x2a, y2a);
      const x2b = b.location.coordinates[1];
      const y2b = b.location.coordinates[0];
      const distanceB = calculateDistance(x1, y1, x2b, y2b);
      return distanceA - distanceB;
    });
    createTable(restaurants);

    const sodexoBtn = document.querySelector('#sodexo');
    const compassBtn = document.querySelector('#compass');
    const resetBtn = document.querySelector('#reset');
if(!sodexoBtn || !compassBtn || !resetBtn){
  throw new Error('Buttons doens exist')
}
    sodexoBtn.addEventListener('click', () => {
      const sodexoRestaurants = restaurants.filter(
        (restaurant) => restaurant.company === 'Sodexo'
      );
      console.log(sodexoRestaurants);
      createTable(sodexoRestaurants);
    });

    compassBtn.addEventListener('click', () => {
      const compassRestaurants = restaurants.filter(
        (restaurant) => restaurant.company === 'Compass Group'
      );
      console.log(compassRestaurants);
      createTable(compassRestaurants);
    });

    resetBtn.addEventListener('click', () => {
      createTable(restaurants);
    });
  } catch (error) {
    modal.innerHTML = errorModal((error as Error).message);
    modal.showModal();
  }
};

navigator.geolocation.getCurrentPosition(success, error, positionOptions);
